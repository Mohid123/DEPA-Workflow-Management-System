import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { TuiDialogContext, TuiDialogService, TuiNotification } from '@taiga-ui/core';
import { BehaviorSubject, Subject, Subscription, debounceTime, map, of, pluck, switchMap, take, takeUntil } from 'rxjs';
import {PolymorpheusContent} from '@tinkoff/ng-polymorpheus';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkflowsService } from '../workflows.service';
import { AuthService } from '../../auth/auth.service';
import domToImage from 'dom-to-image';
import { StorageItem, getItem } from 'src/core/utils/local-storage.utils';
import { DashboardService } from '../../dashboard/dashboard.service';
import { PdfGeneratorService } from 'src/core/core-services/pdf-generation.service';
import { saveAs } from 'file-saver';
import { FormioComponent } from '@formio/angular';
import { NotificationsService } from 'src/core/core-services/notifications.service';
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
  approve: FormControl = new FormControl(false);
  reject: FormControl = new FormControl(false);
  remarks = new FormControl('');
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
  formData = new BehaviorSubject<any>(null);
  readonly control = new FormControl([], Validators.required);
  readonly addControl = new FormControl([], Validators.required);
  userItems: any[] = [];
  nonListuserItems: any[] = [];
  limit = 10;
  page = 0;
  search$ = new BehaviorSubject<string>('');
  editStepUserData = new BehaviorSubject<any>({})
  editingStep = new Subject<boolean>();
  userRoleSysAdmin: any;
  condition = new FormControl('none');
  conditionAddUser = new FormControl('none');
  showConditionError = new Subject<boolean>();
  deleteUserID: string;
  @ViewChild(FormioComponent, { static: false }) formioComponent: FormioComponent;

  constructor(
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
    private activatedRoute: ActivatedRoute,
    private workflowService: WorkflowsService,
    private auth: AuthService,
    private dashboard: DashboardService,
    private router: Router,
    private pdfGeneratorService: PdfGeneratorService,
    private notif: NotificationsService
  ) {
    this.currentUser = this.auth.currentUserValue;
    this.userRoleSysAdmin = this.auth.checkIfRolesExist('sysAdmin')
    this.fetchData();
    this.getUserData(this.limit, this.page);
  }

  ngOnInit(): void {
    const hierarchy = getItem(StorageItem.navHierarchy);
    hierarchy.forEach(val => {
      val.routerLink = `/modules/${val.code}?moduleID=${getItem(StorageItem.moduleID)}`
    })
    this.dashboard.items = [...hierarchy, {
      caption: getItem(StorageItem.formKey),
      routerLink: `/modules/${getItem(StorageItem.moduleSlug)}/${getItem(StorageItem.formKey)}/${getItem(StorageItem.formID)}`
    }];

    this.search$.pipe(debounceTime(400), takeUntil(this.destroy$)).subscribe(value => {
      this.dashboard.getAdminUsers(this.limit, this.page, value)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.userItems = [...new Set(res.results?.map(value => value?.fullName))];
      });
    });

    this.control?.valueChanges?.pipe(takeUntil(this.destroy$)).subscribe(data => {
      if(data?.length < 2) {
        this.condition.setValue('none');
        this.condition.disable();
      }
      if(data?.length >= 2) {
        this.condition.enable();
        if(this.condition?.value == 'none') {
          this.showConditionError.next(true)
        }
      }
    });

    this.addControl?.valueChanges?.pipe(takeUntil(this.destroy$)).subscribe(data => {
      if(data?.length < 2) {
        this.conditionAddUser.setValue('none');
        this.conditionAddUser.disable();
      }
      if(data?.length >= 2) {
        this.conditionAddUser.enable();
        if(this.conditionAddUser?.value == 'none') {
          this.showConditionError.next(true)
        }
      }
    });

    this.condition?.valueChanges?.pipe(takeUntil(this.destroy$)).subscribe(data => {
      if(data !== 'none') {
        this.showConditionError.next(false)
      }
    })

    this.conditionAddUser?.valueChanges?.pipe(takeUntil(this.destroy$)).subscribe(data => {
      if(data !== 'none') {
        this.showConditionError.next(false)
      }
    })
  }

  getUserData(limit: number, page: number) {
    this.dashboard.getAdminUsers(limit, page)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      this.nonListuserItems = res.results?.map(value => {
        return {
          id: value?.id,
          fullName: value?.fullName
        }
      });
      this.userItems = res.results?.map(value => value?.fullName);
    });
  }

  onSearch(search: any) {
    this.search$.next(search);
  }

  onChange(event: any) {
    if(event?.data && event?.changed) {
      if(event?.data?.file) {
        event?.data?.file?.forEach(value => {
          value.url = value?.data?.baseUrl.split('v1')[0] + value?.data?.fileUrl
        })
      }
      this.formData.next(event)
    }
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
        this.approvedUsers = this.workflowData?.workflowStatus?.map(data => {
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
          data.components?.map(innerData => {
            if(innerData?.permissions?.length > 0) {
              innerData?.permissions?.map(permit => {
                if(this.currentUser?.id == permit?.id) {
                  if(permit.canEdit == true) {
                    innerData.disabled = false
                  }
                  else {
                    innerData.disabled = true
                  }
                  if(permit.canView == false) {
                    innerData.hidden = true
                  }
                  else {
                    innerData.hidden = false
                  }
                }
              })
            }
          })
          return {
            ...data,
            components: data.components?.map(data => {
              if(data?.label && data?.label == 'Submit') {
                data.hidden = true;
                return data
              }
              return data
            }),
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
                name: val?.performedBy == null ? val?.assignedTo?.fullName : val?.performedBy?.fullName + ' on behalf of ' + val?.assignedTo?.fullName,
                id: val?.assignedTo?._id,
                stepId: userData?.stepId
              }
            }),
            condition: userData?.condition,
            status: userData?.status,
            stepId: userData?.stepId,
            _id: userData?._id,
            allUsers: userData?.allUsers,
            activeUsers: userData?.activeUsers?.map(value => value?.fullName)
          }
        });
        this.workflowProgress.next(this.workflowData?.summaryData?.progress);
        this.approvalLogs = this.workflowData?.approvalLog;
        this.allApproved = this.workflowData?.workflowStatus?.map(userData => userData?.status == 'approved' ? true: false);
        this.adminUsers = this.workflowData?.subModuleId?.adminUsers;
        this.loadingData.next(false)
      }
    });
  }

  showDialog(data: any, content: PolymorpheusContent<TuiDialogContext>): void {
    this.approve = new FormControl(false);
    this.reject = new FormControl(false);
    this.decisionData.next(data)
    this.saveDialogSubscription.push(this.dialogs.open(content, {
      dismissible: false,
      closeable: false
    }).pipe(take(1)).subscribe())
  }

  openEditUserDialog(content: PolymorpheusContent<TuiDialogContext>, data: any): void {
    this.control.setValue(data?.activeUsers);
    this.condition.setValue(data?.condition);
    this.editStepUserData.next(data);
    this.saveDialogSubscription.push(this.dialogs.open(content, {
      dismissible: false,
      closeable: false,
      size: 'l'
    }).pipe(take(1)).subscribe())
  }

  openAddStepDialog(content: PolymorpheusContent<TuiDialogContext>): void {
    this.saveDialogSubscription.push(this.dialogs.open(content, {
      dismissible: false,
      closeable: false,
      size: 'l'
    }).pipe(take(1)).subscribe())
  }

  openDeleteUserDialog(content: PolymorpheusContent<TuiDialogContext>, data: any): void {
    this.deleteUserID = data?._id;
    this.saveDialogSubscription.push(this.dialogs.open(content, {
      dismissible: false,
      closeable: false,
    }).pipe(take(1)).subscribe())
  }

  deleteStep() {
    this.editingStep.next(true);
    const payload = {
      action: 'delete',
      stepStatus: {
        _id: this.deleteUserID
      }
    }
    this.workflowService.updateWorkflowStep(payload, this.workflowID)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if(res) {
        this.editingStep.next(false);
        this.saveDialogSubscription.forEach(val => val.unsubscribe());
        this.fetchData()
      }
    })
  }

  addNewStep() {
    this.editingStep.next(true);
    let activeNewUsers = this.nonListuserItems?.map((value, index) => {
      if(this.addControl.value?.includes(value?.fullName)) {
        return value?.id
      }
    }).filter(val => val);
    const payload = {
      action: 'add',
      stepStatus: {
        approverIds: activeNewUsers,
        condition: this.conditionAddUser?.value
      }
    }
    this.workflowService.updateWorkflowStep(payload, this.workflowID)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if(res) {
        this.editingStep.next(false);
        this.saveDialogSubscription.forEach(val => val.unsubscribe());
        this.addControl.reset();
        this.conditionAddUser.reset();
        this.fetchData()
      }
    })
  }

  updateUserStep() {
    this.editingStep.next(true);
    let finalData = {...this.editStepUserData?.value}
    let activeNewUsers = this.nonListuserItems?.map((value, index) => {
      if(this.control.value?.includes(value?.fullName)) {
        return value?.id
      }
    }).filter(val => val);

    let allnewUsers = activeNewUsers?.map((value, index) => {
      return {assignedTo: value}
    }).filter(val => val);
    delete finalData?.approverIds;
    const payload = {
      action: 'edit',
      stepStatus: Object.assign(
      finalData,
      {activeUsers: activeNewUsers},
      {allUsers: allnewUsers},
      {condition: this.condition?.value}
    )}
    this.workflowService.updateWorkflowStep(payload, this.workflowID)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if(res) {
        this.editingStep.next(false);
        this.saveDialogSubscription.forEach(val => val.unsubscribe());
        this.fetchData()
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
    this.savingDecision.next(true);
    const payload: any = {
      stepId: this.decisionData?.value?.stepId || this.decisionData?.value[0]?.stepId,
      userId: this.currentUser?.id,
      remarks: this.remarks?.value || undefined,
      isApproved: this.approve?.value == true ? true : false,
      type: 'submittal'
    }
    if(this.currentUser?.id !== this.decisionData?.value?.id) {
      Object.assign(payload, {onBehalfOf: this.currentUser?.id}, {userId: this.decisionData?.value?.id})
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
    if(value?.includes('of')) {
      value = value?.split('of')[1].trimStart();
    }
    return this.approvedUsers?.map(val => {
      if(val.users?.includes(value) && val.status == 'inProgress') {
        return true
      }
      return false
    })
  }

  checkApprovedStatus(value: any, index: number): boolean {
    if(value?.includes('of')) {
      value = value?.split('of')[1].trimStart();
    }
    if(this.approvedUsers?.map(data => data.status)[index] === 'approved' || this.approvedUsers?.map(data => data.status)[index] === 'inProgress') {
      return this.approvedUsers[index].users?.includes(value)
    }
    return false
  }

  userApprovedCheckResult(value): boolean {
    return this.checkIfUserIsApproved(value).includes(true)
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

  updateFormData() {
    if(!this.formioComponent.submission) {
      return this.notif.displayNotification('Please provide valid submission data', 'Create Submission', TuiNotification.Warning)
    }
    if(this.formioComponent.submission && this.formioComponent.submission?.isValid == false) {
      return this.notif.displayNotification('Form submission is invalid', 'Create Submission', TuiNotification.Warning)
    }
    let formUpdated = JSON.parse(JSON.stringify(this.formWithWorkflow));
    const formDataIds = formUpdated?.map(data => {
      return {
        formId: data?.formDataId,
        data: data?.data,
        id: data?._id
      }
    })
    this.workflowService.updateMultipleFormsData({formDataIds}).pipe(takeUntil(this.destroy$)).subscribe(val => {
      if(val) {
        this.fetchData()
      }
    })
  }

  backToListing() {
    this.router.navigate([`/modules/${getItem(StorageItem.moduleSlug)}`], {queryParams: {moduleID: getItem(StorageItem.moduleID)}})
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
    return (
      this.approvalLogs?.map(value => value?.approvalStatus)?.includes('approved') ||
      this.approvalLogs?.map(value => value?.approvalStatus)?.includes('created')
    )
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
