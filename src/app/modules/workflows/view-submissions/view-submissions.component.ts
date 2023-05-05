import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, map, pluck, switchMap } from 'rxjs';
import { WorkflowsService } from '../workflows.service';

@Component({
  templateUrl: './view-submissions.component.html',
  styleUrls: ['./view-submissions.component.scss']
})
export class ViewSubmissionsComponent {
  submissionData: Observable<any>;
  submoduleId: string;

  constructor(private activatedRoute: ActivatedRoute, private workflowService: WorkflowsService) {
    this.submissionData = this.activatedRoute.params.pipe(
      pluck('id'),
      map(id => this.submoduleId = id),
      switchMap((subId => this.workflowService.getSubmissionFromSubModule(subId)))
    );
  }
}
