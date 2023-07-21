import { Component, ElementRef, Inject, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TuiDialogContext, TuiDialogService } from '@taiga-ui/core';
import { BehaviorSubject, Subject, Subscription, map, of, pluck, switchMap, take, takeUntil } from 'rxjs';
import {PolymorpheusContent} from '@tinkoff/ng-polymorpheus';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkflowsService } from '../workflows.service';
import { AuthService } from '../../auth/auth.service';
import domToImage from 'dom-to-image';
import { StorageItem, getItem } from 'src/core/utils/local-storage.utils';
import { DashboardService } from '../../dashboard/dashboard.service';
import { PdfGeneratorService } from 'src/core/core-services/pdf-generation.service';
import { saveAs } from 'file-saver';

@Component({
  templateUrl: './view-workflow.component.html',
  styleUrls: ['./view-workflow.component.scss']
})
export class ViewWorkflowComponent implements OnDestroy, OnInit {
  @ViewChild('formPdf', {static: false}) formPdf: ElementRef;
  public formWithWorkflow: any;
  readonly max = 100;
  readonly value$ = of(25);
  destroy$ = new Subject();
  activeIndex: number = 0;
  workflowUsers = [];
  approvalLogs = []
  approve = new FormControl(false);
  reject = new FormControl(false);
  remarks = new FormControl('');
  showLoader = new Subject<boolean>();
  workflowData: any;
  workflowID: string;
  formTabs: any[] = [];
  currentUser: any;
  workflowProgress = new BehaviorSubject<number>(0);
  saveDialogSubscription: Subscription[] = [];
  decisionData = new BehaviorSubject<any>(null);
  savingDecision = new Subject<boolean>();
  approvedUsers: any[] = [];
  activeUsers: any[] = [];
  formAllowedForEditUsers: any[] = [];
  formDataSubmission: any;
  allApproved: any;
  activeStep: any;
  lastApprovalCheck: any;
  loadingData = new Subject<boolean>();
  index = NaN;
  labels = ['Active', 'Approved', 'Pending', 'Rejected'];
  sendingDecision = new Subject<boolean>();
  dialogTitle: string
  isDeleting: string;
  currentStepId: string;
  downloadingPDF = new Subject<boolean>();
  adminUsers: any[] = [];

  constructor(
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
    private activatedRoute: ActivatedRoute,
    private workflowService: WorkflowsService,
    private auth: AuthService,
    private dashboard: DashboardService,
    private router: Router,
    private pdfGeneratorService: PdfGeneratorService
  ) {
    this.currentUser = this.auth.currentUserValue;
    this.fetchData();
    this.approve.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(val => {
      if(val === true) {
        this.reject.disable();
        this.showLoader.next(true);
        setTimeout(() => this.showLoader.next(false), 1000)
      }
      if(val === false && this.reject.disabled) {
        this.reject.enable()
      }
    });
    this.reject.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(val => {
      if(val === true) {
        this.approve.disable();
        this.showLoader.next(true);
        setTimeout(() => this.showLoader.next(false), 1000)
      }
      if(val === false && this.approve.disabled) {
        this.approve.enable()
      }
    });
  }

  ngOnInit(): void {
    const hierarchy = getItem(StorageItem.navHierarchy);
    hierarchy.forEach(val => {
      val.routerLink = `/modules/${val.caption}?moduleID=${getItem(StorageItem.moduleID)}`
    })
    this.dashboard.items = [...hierarchy, {
      caption: getItem(StorageItem.formKey),
      routerLink: `/modules/${getItem(StorageItem.moduleSlug)}/${getItem(StorageItem.formKey)}`
    }];
  }

  get label(): string {
    return Number.isNaN(this.index) ? '' : this.labels[this.index];
  }

  onChange(event: any) {
    if(event?.data && event?.changed) {
      if(event?.data?.file) {
        event?.data?.file?.forEach(value => {
          value.url = value?.data?.baseUrl.split('v1')[0] + value?.data?.fileUrl
        })
      }
    }
  }

  getColor(index: number): string {
    return `var(--tui-chart-${index})`;
  }

  isItemActive(index: number): boolean {
    return this.index === index;
  }

  onHover(index: number, hovered: any): void {
    this.index = hovered ? index : 0;
  }

  fetchData() {
    this.loadingData.next(true)
    this.activatedRoute.params.pipe(
      pluck('id'),
      map(id => this.workflowID = id),
      switchMap((subId => this.workflowService.getWorkflowSubmission(subId)))
    ).subscribe(async (data) => {
      if(data) {
        this.workflowData = data;
        this.currentStepId = await this.workflowData?.workflowStatus?.filter(data => {
          return data?.status == 'inProgress' ? data : null
        })[0]?.stepId;
        this.formAllowedForEditUsers = await this.workflowData?.workflowStatus?.map(data => {
          return {
            users: data?.activeUsers?.map(val => val?.fullName),
            status: data?.status
          }
        });
        this.approvedUsers = await this.workflowData?.workflowStatus?.map(data => {
          return {
            users: data?.approvedUsers?.map(user => user?.fullName),
            status: data?.status
          }
        });
        this.lastApprovalCheck = {
          status: this.workflowData?.approvalLog.at(-1)?.approvalStatus,
          user: this.workflowData?.approvalLog.at(-1)?.performedById?.fullName
        };
        this.formTabs = await this.workflowData?.formIds?.map(val => val.title);
        this.formWithWorkflow = await this.workflowData?.formIds?.map(data => {
          return {
            ...data,
            formDataId: this.workflowData?.formDataIds?.map(val => {
              if(val.formId == data?._id) {
                return val?._id
              }
            }).filter(val => val)[0],
            data: this.workflowData?.formDataIds?.map(val => {
              if(val.formId == data?._id) {
                return val?.data
              }
            }).filter(val => val)[0]
          }
        });
        this.activeUsers = await this.workflowData?.workflowStatus?.flatMap(data => data?.activeUsers)?.map(user => user?.fullName);
        this.workflowUsers = await this.workflowData?.workflowStatus?.map(userData => {
          return {
            approverIds: userData?.allUsers?.map(val => {
              return {
                name: val?.fullName,
                id: val?._id,
                stepId: userData?.stepId
              }
            }),
            condition: userData?.condition,
            status: userData?.status
          }
        });
        this.workflowProgress.next(this.workflowData?.summaryData?.progress);
        this.approvalLogs = this.workflowData?.approvalLog;
        this.allApproved = this.workflowData?.workflowStatus?.map(userData => userData?.status == 'approved' ? true: false);
        this.adminUsers = this.workflowData?.subModuleId?.adminUsers
        this.loadingData.next(false)
      }
    });
  }

  showDialog(data: any, content: PolymorpheusContent<TuiDialogContext>): void {
    this.showLoader.pipe(takeUntil(this.destroy$)).subscribe(val => {
      if(val === false) {
        this.decisionData.next(data)
        this.saveDialogSubscription.push(this.dialogs.open(content, {
          dismissible: false,
          closeable: false
        }).pipe(take(1)).subscribe())
      }
    })
  }

  showDeleteDialog(content: PolymorpheusContent<TuiDialogContext>, checkDecision: string): void {
    this.isDeleting = checkDecision;
    if(checkDecision == 'delete') {
      this.dialogTitle = 'Delete'
    }
    if(checkDecision == 'cancel') {
      this.dialogTitle = 'Cancel'
    }
    if(checkDecision == 'enable') {
      this.dialogTitle = 'Enable'
    }
    this.saveDialogSubscription.push(this.dialogs.open(content, {
      dismissible: true,
      closeable: true
    }).subscribe());
  }

  sendApproveOrRejectDecisionData() {
    this.savingDecision.next(true)
    const payload: any = {
      stepId: this.decisionData?.value?.stepId || this.decisionData?.value[0]?.stepId,
      userId: this.currentUser?.id,
      remarks: this.remarks?.value || undefined,
      isApproved: this.approve?.value == true ? true : false,
      type: 'submittal'
    }
    this.workflowService.updateSubmissionWorkflow(this.workflowID, payload).pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if(res) {
        this.fetchData();
        this.savingDecision.next(false);
        this.remarks.reset();
        this.saveDialogSubscription.forEach(val => val.unsubscribe());
        this.reject.reset();
        this.approve.reset();
        this.reject.enable();
        this.approve.enable();
      }
      else {
        this.savingDecision.next(false);
      }
    })
  }

  sendDeleteOrCancelDecision() {
    this.sendingDecision.next(true)
    let payload: any = {
      stepId: this.currentStepId,
      userId: this.currentUser?.id,
      remarks: this.remarks?.value || undefined,
      type: 'submittal'
    }
    if(this.isDeleting == 'delete') {
      Object.assign(payload, {status: 2})
      this.workflowService.updateSubmissionWorkflow(this.workflowID, payload).pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if(res) {
          this.sendingDecision.next(false)
          this.saveDialogSubscription.forEach(val => val.unsubscribe());
          this.router.navigate(['/modules', getItem(StorageItem.moduleSlug) || ''], {queryParams: {moduleID: getItem(StorageItem.moduleID) || ''}});
        }
      })
    }
    if(this.isDeleting == 'cancel') {
      Object.assign(payload, {submissionStatus: 5});
      this.workflowService.updateSubmissionWorkflow(this.workflowID, payload).pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if(res) {
          this.sendingDecision.next(false)
          this.saveDialogSubscription.forEach(val => val.unsubscribe);
          this.remarks.reset();
          this.fetchData();
          // this.router.navigate(['/modules', getItem(StorageItem.moduleSlug) || ''], {queryParams: {moduleID: getItem(StorageItem.moduleID) || ''}});
        }
      })
    }
    if(this.isDeleting == 'enable') {
      Object.assign(payload, {submissionStatus: 2});
      this.workflowService.updateSubmissionWorkflow(this.workflowID, payload).pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if(res) {
          this.sendingDecision.next(false)
          this.saveDialogSubscription.forEach(val => val.unsubscribe);
          this.fetchData();
          // this.router.navigate(['/modules', getItem(StorageItem.moduleSlug) || ''], {queryParams: {moduleID: getItem(StorageItem.moduleID) || ''}});
        }
      })
    }
  }

  cancelDecision() {
    this.remarks.reset();
    this.saveDialogSubscription.forEach(val => val.unsubscribe());
    this.reject.reset()
    this.approve.reset()
    this.reject.enable();
    this.approve.enable();
  }

  changeProgressColor(value: number) {
    if(value <= 49) {
      return '#F15B41'
    }
    if(value > 49 && value < 75) {
      return '#F9B71A'
    }
    if(value >= 75) {
      return '#32de84'
    }
    return '#fff'
  }

  checkIfUserisPartofWorkflow(data: any) {
    return data?.map(val => val?._id)?.includes(this.currentUser?.id)
  }

  checkIfUserisActiveUser() {
    return this.workflowData?.workflowStatus?.flatMap(val => val?.status == 'inProgress' ? val.activeUsers: null)?.filter(val => val).includes(this.currentUser?.id)
  }

  checkIfUserisAllUser() {
    return this.workflowData?.workflowStatus?.flatMap(val => val?.status == 'inProgress' ? val.allUsers: null)?.filter(val => val).includes(this.currentUser?.id)
  }

  checkIfUserCanEditForm(): any[] {
    return this.formAllowedForEditUsers?.map(val => {
      if(val.users?.includes(this.currentUser?.fullName) && val.status == 'inProgress') {
        return true
      }
      return false
    })
  }

  checkIfUserIsInEditUsers(): boolean {
    return this.checkIfUserCanEditForm().includes(true)
  }

  checkIfUserIsApproved(value: any): any[] {
    return this.approvedUsers?.map(val => {
      if(val.users?.includes(value) && val.status == 'inProgress') {
        return true
      }
      return false
    })
  }

  checkApprovedStatus(value: any, index: number): boolean {
    if(this.approvedUsers?.map(value => value.status)[index] === 'inProgress') {
      return this.approvedUsers[index].users?.includes(value)
    }
    return this.approvedUsers?.flatMap(val => val?.users)?.includes(value)
  }

  userApprovedCheckResult(): boolean {
    return this.checkIfUserIsApproved(this.currentUser?.fullName).includes(true)
  }

  checkIfUserisStillActive(value: any): boolean {
    return this.activeUsers.includes(value)
  }

  checkIfUserRejected(approvers: any[]) {
    return this.lastApprovalCheck?.status == 'rejected' && this.currentUser?.fullName == this.lastApprovalCheck?.user && approvers?.map(val => val?.name).indexOf(this.currentUser?.fullName) !== 0
  }

  checkIfLoggedInUserIsPartOfActiveUsers(): boolean {
    return this.activeUsers.includes(this.currentUser?.fullName)
  }

  checkIfAllApproved(): boolean {
    return !this.allApproved.includes(false)
  }

  checkIfUserIsInAdminUsers() {
    return this.adminUsers?.includes(this.currentUser?.id)
  }

  updateFormData(event: any) {
    const payload: any = {
      formId: event?._id,
      data: event?.data
    }
    this.workflowService.updateFormsData(payload, event?.formDataId)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if(res) {
        this.fetchData();
      }
    })
  }

  hideRejectButton(condition: string, workflowIndex: number, approvers: any[]): boolean {
    if(condition == 'none' && workflowIndex == 0) {
      return true
    }
    if(condition == 'or' && workflowIndex == 0) {
      return true
    }
    return false
  }

  checkApprovalLogs() {
    return this.approvalLogs?.map(value => value?.approvalStatus)?.includes('approved')
  }

  downloadAsPDF() {
    this.downloadingPDF.next(true);
    this.formWithWorkflow?.forEach(formData => {
      const width = this.formPdf.nativeElement.clientWidth;
      const height = this.formPdf.nativeElement.clientHeight + 300;
      const domElements = this.formPdf?.nativeElement;
      domToImage.toPng(domElements, {
        width: width * 2,
        height: height  * 2,
        style: {
          transform: "scale(" + 2 + ")",
          transformOrigin: "top left"
        }
      })
      .then(async (value: any) => {
        const pdfBytes = await this.pdfGeneratorService.generatePdf(formData?.data, value, width);
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        saveAs(blob, 'form_data.pdf');
        this.downloadingPDF.next(false);
      })
      .catch(error => {
        throw error
      })
    })
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
