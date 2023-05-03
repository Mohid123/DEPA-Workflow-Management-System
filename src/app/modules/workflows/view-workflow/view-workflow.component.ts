import { Component, Inject, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TuiDialogContext, TuiDialogService } from '@taiga-ui/core';
import { Subject, of, takeUntil } from 'rxjs';
import { emailLoginForm } from 'src/app/forms/forms';
import {PolymorpheusContent} from '@tinkoff/ng-polymorpheus';

@Component({
  templateUrl: './view-workflow.component.html',
  styleUrls: ['./view-workflow.component.scss']
})
export class ViewWorkflowComponent implements OnDestroy {
  public formWithWorkflow = emailLoginForm;
  readonly max = 100;
  readonly value$ = of(25);
  destroy$ = new Subject();
  workflowUsers = [
    {
      approverIds: ['Junaid', 'Satti', 'Javed', 'Kamran'],
      condition: 'or',
      stepStatus: 'approved'
    },
    {
      approverIds: ['Ahtasham', 'Masood'],
      condition: 'and',
      stepStatus: 'rejected'
    },
    {
      approverIds: ['Saqib', 'Mehmood', 'Imran'],
      condition: 'or',
      stepStatus: 'pending'
    },
    {
      approverIds: ['Yawar', 'Tabish', 'Irfan', 'Sohail'],
      condition: 'or',
      stepStatus: 'pending'
    }
  ];

  approvalLogs = [
    {
      approvedBy: 'Satti',
      approvedOn: '5/3/2023',
      comments: 'All good!'
    }
  ]

  approve = new FormControl(false);
  reject = new FormControl(false);
  showLoader = new Subject<boolean>();

  constructor(@Inject(TuiDialogService) private readonly dialogs: TuiDialogService) {
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
