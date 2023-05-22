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
    this.activatedRoute.params.subscribe(val => this.submoduleId = val['id']);
    this.submissionData = this.activatedRoute.params.pipe(
      switchMap(() => this.workflowService.getSubmissionFromSubModule(this.submoduleId))
    );
    this.submissionData.subscribe(val => console.log(val))
  }

  showStatus(submissionStatus: number): string {
    if(submissionStatus === 1) {
      return 'Active'
    }
    if(submissionStatus === 3) {
      return 'Completed'
    }
    if(submissionStatus === 2) {
      return 'In Progress'
    }
    return 'Rejected'
  }
 }
