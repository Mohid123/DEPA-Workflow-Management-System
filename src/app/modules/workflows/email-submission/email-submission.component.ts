import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { WorkflowsService } from '../workflows.service';
import { NotificationsService } from 'src/core/core-services/notifications.service';
import { TuiLoaderModule, TuiNotification } from '@taiga-ui/core';
import { CommonModule } from '@angular/common';

@Component({
  templateUrl: './email-submission.component.html',
  styleUrls: ['./email-submission.component.scss'],
  standalone: true,
  imports: [CommonModule, TuiLoaderModule]
})
export class EmailSubmissionComponent implements OnDestroy {
  /**
   * Subject used to unsubsribe from active observabel streams
   */
  destory$ = new Subject();

  /**
   * Subject for maintaining the loading state
   */
  savingDecision = new BehaviorSubject<boolean>(true);

  /**
   * A string boolean to check if user decision has been made
   */
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
        this.workflowService.updateSubmissionByEmail(res['submissionId'], payload).pipe(takeUntil(this.destory$))
        .subscribe((res: any) => {
          this.savingDecision.next(false);
        })
      }
      else {
        this.savingDecision.next(false)
        this.notif.displayNotification('Something Went Wrong', 'Update Submission', TuiNotification.Error)
      }
    })
  }

  /**
   * Built in Angular Lifecycle method that is run when component or page is destroyed or removed from DOM
   */
  ngOnDestroy(): void {
    this.destory$.complete();
    this.destory$.unsubscribe();
  }
}
