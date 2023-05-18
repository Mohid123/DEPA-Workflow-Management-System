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
  activeUsers: any[] = [];
  formDataSubmission: any;

  constructor(
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
    private activatedRoute: ActivatedRoute,
    private workflowService: WorkflowsService,
    private auth: AuthService
  ) {
    this.currentUser = this.auth.currentUserValue;
    this.fetchData()
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
        this.formTabs = this.workflowData?.formIds?.map(val => val.title);
        this.formWithWorkflow = this.workflowData?.formIds?.map(data => {
          return {
            ...data,
            data: this.workflowData?.formDataIds?.map(val => {
              if(val.formId == data?._id) {
                return val?.data
              }
            }).filter(val => val)[0]
          }
        });
        console.log(this.formWithWorkflow)
        this.activeUsers = this.workflowData?.workflowStatus?.flatMap(data => data?.activeUserIds)?.map(user => user?.fullName);
        // console.log(this.activeUsers)
        // console.log('WORKFLO DATA: ', this.workflowData)
        this.workflowUsers = this.workflowData?.workflowStatus?.map(users => {
          return {
            approverIds: users?.allUserIds?.map(val => {
              return {
                name: val?.fullName,
                id: val?._id,
                stepId: users?.stepId
              }
            }),
            condition: users?.condition,
            status: users?.status
          }
        });
        this.workflowProgress.next(this.workflowData?.summaryData?.progress);
        this.approvalLogs = this.workflowData?.approvalLog;
      }
    });
  }

  showDialog(data: any, content: PolymorpheusContent<TuiDialogContext>): void {
    this.showLoader.pipe(takeUntil(this.destroy$)).subscribe(val => {
      if(val === false) {
        this.decisionData.next(data)
        this.saveDialogSubscription.push(this.dialogs.open(content).pipe(take(1)).subscribe())
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
    })
  }

  checkIfUserIsActive(value: any): boolean {
    return this.activeUsers.includes(value)
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
