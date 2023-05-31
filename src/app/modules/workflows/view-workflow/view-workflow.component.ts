import { Component, Inject, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TuiDialogContext, TuiDialogService } from '@taiga-ui/core';
import { BehaviorSubject, Subject, Subscription, first, map, of, pluck, switchMap, take, takeUntil } from 'rxjs';
import {PolymorpheusContent} from '@tinkoff/ng-polymorpheus';
import { ActivatedRoute } from '@angular/router';
import { WorkflowsService } from '../workflows.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  templateUrl: './view-workflow.component.html',
  styleUrls: ['./view-workflow.component.scss']
})
export class ViewWorkflowComponent implements OnDestroy {
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
      this.fetchData()
      this.savingDecision.next(false);
      this.remarks.reset();
      this.saveDialogSubscription.forEach(val => val.unsubscribe());
      this.reject.reset()
      this.approve.reset()
    })
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

  checkIfUserRejected() {
    return this.lastApprovalCheck?.status == 'rejected' && this.currentUser?.fullName == this.lastApprovalCheck?.user
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

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
