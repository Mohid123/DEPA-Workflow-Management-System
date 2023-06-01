import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, map, pluck, switchMap } from 'rxjs';
import { WorkflowsService } from '../workflows.service';
import { StorageItem, setItem } from 'src/core/utils/local-storage.utils';

@Component({
  templateUrl: './view-submissions.component.html',
  styleUrls: ['./view-submissions.component.scss']
})
export class ViewSubmissionsComponent {
  submissionData: Observable<any>;
  submoduleId: string;

  constructor(private activatedRoute: ActivatedRoute, private workflowService: WorkflowsService) {
    this.activatedRoute.params.subscribe(val => {
      this.submoduleId = val['id']
      setItem(StorageItem.workflowID, val['id'])
    });
    this.submissionData = this.activatedRoute.params.pipe(
      switchMap(() => this.workflowService.getSubmissionFromSubModule(this.submoduleId))
    );
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
