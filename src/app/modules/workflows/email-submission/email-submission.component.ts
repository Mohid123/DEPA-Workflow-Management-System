import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { WorkflowsService } from '../workflows.service';
import { NotificationsService } from 'src/core/core-services/notifications.service';
import { TuiNotification } from '@taiga-ui/core';

@Component({
  templateUrl: './email-submission.component.html',
  styleUrls: ['./email-submission.component.scss']
})
export class EmailSubmissionComponent implements OnDestroy {
  destory$ = new Subject();
  savingDecision = new BehaviorSubject<boolean>(true);
  userDecision: any;

  constructor(private activatedRoute: ActivatedRoute, private workflowService: WorkflowsService, private notif: NotificationsService) {
    this.activatedRoute.queryParams
    .pipe(takeUntil(this.destory$))
    .subscribe(res => {
      if(res) {
        const payload: any = {
          stepId: res['stepId'],
          userId: res['userId'],
          isApproved: Boolean(res['isApproved'])
        }
        this.userDecision = payload.isApproved
        this.savingDecision.next(true)
        this.workflowService.updateSubmissionWorkflow(res['submissionId'], payload).pipe(takeUntil(this.destory$))
        .subscribe((res: any) => {
          console.log(res)
          this.savingDecision.next(false);
        })
      }
      else {
        this.savingDecision.next(false)
        this.notif.displayNotification('Something Went Wrong', 'Update Submission', TuiNotification.Error)
      }
    })
  }

  ngOnDestroy(): void {
    this.destory$.complete();
    this.destory$.unsubscribe();
  }
}
