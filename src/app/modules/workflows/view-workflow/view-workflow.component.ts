import { Component, ElementRef, Inject, OnDestroy, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TuiDialogContext, TuiDialogService } from '@taiga-ui/core';
import { BehaviorSubject, Subject, Subscription, map, of, pluck, switchMap, take, takeUntil } from 'rxjs';
import {PolymorpheusContent} from '@tinkoff/ng-polymorpheus';
import { ActivatedRoute } from '@angular/router';
import { WorkflowsService } from '../workflows.service';
import { AuthService } from '../../auth/auth.service';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  templateUrl: './view-workflow.component.html',
  styleUrls: ['./view-workflow.component.scss']
})
export class ViewWorkflowComponent implements OnDestroy {
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
  loadingData = new Subject<boolean>()

  constructor(
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
    private activatedRoute: ActivatedRoute,
    private workflowService: WorkflowsService,
    private auth: AuthService
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

  fetchData() {
    this.loadingData.next(true)
    this.activatedRoute.params.pipe(
      pluck('id'),
      map(id => this.workflowID = id),
      switchMap((subId => this.workflowService.getWorkflowSubmission(subId)))
    ).subscribe(data => {
      if(data) {
        this.workflowData = data;
        this.formAllowedForEditUsers = this.workflowData?.workflowStatus?.map(data => {
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
        this.formTabs = this.workflowData?.formIds?.map(val => val.title);
        this.formWithWorkflow = this.workflowData?.formIds?.map(data => {
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
        this.activeUsers = this.workflowData?.workflowStatus?.flatMap(data => data?.activeUsers)?.map(user => user?.fullName);
        this.workflowUsers = this.workflowData?.workflowStatus?.map(userData => {
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

  sendDecisionData() {
    this.savingDecision.next(true)
    const payload: any = {
      stepId: this.decisionData?.value?.stepId,
      userId: this.currentUser?.id,
      remarks: this.remarks?.value,
      isApproved: this.approve?.value == true ? true : false
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

  downloadAsPDF() {
    const formPdf = document.getElementById('formPdf');
    const badges = formPdf.getElementsByTagName('tui-badge');
    const hrs = formPdf.getElementsByTagName('hr');
    const decisionBtns = formPdf.getElementsByClassName('decision-buttons');
    Array.from(badges).forEach(val => val.remove())
    Array.from(hrs).forEach(val => val.remove())
    Array.from(decisionBtns).forEach(val => val?.remove())
    html2canvas(formPdf).then((canvas) => {
      this.fetchData()
      let fileWidth = 200;
      let fileHeight = (canvas.height * fileWidth) / canvas.width;
      const FILEURI = canvas.toDataURL('image/png');
      let PDF = new jsPDF('p', 'mm', 'a4');
      PDF.addImage(FILEURI, 'PNG', 3, 10, fileWidth, fileHeight);
      PDF.save('Form_Data_and_Workflow.pdf');
    })
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
