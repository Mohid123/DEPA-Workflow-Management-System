import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { WorkflowsService } from '../workflows.service';
import { NotificationsService } from 'src/core/core-services/notifications.service';
import { TuiNotification } from '@taiga-ui/core';

@Component({
  templateUrl: './email-submission.component.html',
  styleUrls: ['./email-submission.component.scss']
})
export class EmailSubmissionComponent implements OnDestroy {
  destory$ = new Subject();
  savingDecision = new Subject<boolean>();

  constructor(private activatedRoute: ActivatedRoute, private workflowService: WorkflowsService, private notif: NotificationsService) {
    this.activatedRoute.queryParams
    .pipe(takeUntil(this.destory$))
    .subscribe(res => {
      debugger
      this.savingDecision.next(true)
      if(res) {
        const payload: any = {
          stepId: res['stepId'],
          userId: res['userId'],
          remarks: res['remarks'],
          isApproved: res['isApproved']
        }
        console.log(res)
        // this.workflowService.updateSubmissionWorkflow(res['id'], payload).pipe(takeUntil(this.destory$))
        // .subscribe((res: any) => {
        //   this.savingDecision.next(false);
        // })
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
