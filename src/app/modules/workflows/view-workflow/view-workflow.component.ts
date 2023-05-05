import { Component, Inject, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TuiDialogContext, TuiDialogService } from '@taiga-ui/core';
import { BehaviorSubject, Observable, Subject, map, of, pluck, switchMap, takeUntil } from 'rxjs';
import { emailLoginForm } from 'src/app/forms/forms';
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
  showLoader = new Subject<boolean>();
  workflowData: any;
  workflowID: string;
  formTabs: any[] = [];
  currentUser: any;
  workflowProgress = new BehaviorSubject<number>(0)

  constructor(
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
    private activatedRoute: ActivatedRoute,
    private workflowService: WorkflowsService,
    private auth: AuthService
  ) {
    this.currentUser = this.auth.currentUserValue
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

    this.workflowData = this.activatedRoute.params.pipe(
      pluck('id'),
      map(id => this.workflowID = id),
      switchMap((subId => this.workflowService.getWorkflowSubmission(subId)))
    ).subscribe(data => {
      if(data) {
        this.workflowData = data;
        console.log(this.workflowData);
        this.formTabs = this.workflowData?.formIds?.map(val => val.title);
        this.formWithWorkflow = this.workflowData?.formIds;
        this.workflowUsers = this.workflowData?.workflowStatus?.map(users => {
          return {
            approverIds: users?.allUserIds,
            condition: users?.condition,
            status: users?.status
          }
        });
        this.workflowProgress.next(this.workflowData?.summaryData?.progress);
        this.approvalLogs = this.workflowData?.approvalLog;
      }
    });
  }

  showDialog(content: PolymorpheusContent<TuiDialogContext>): void {
    this.showLoader.pipe(takeUntil(this.destroy$)).subscribe(val => {
      if(val === false) {
        this.dialogs.open(content).subscribe();
      }
    })
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
