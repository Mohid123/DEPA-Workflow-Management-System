import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription, map, pluck, switchMap } from 'rxjs';
import { WorkflowsService } from '../workflows.service';
import { StorageItem, setItem } from 'src/core/utils/local-storage.utils';
import { AuthService } from '../../auth/auth.service';

@Component({
  templateUrl: './view-submissions.component.html',
  styleUrls: ['./view-submissions.component.scss']
})
export class ViewSubmissionsComponent implements OnDestroy {
  submissionData: Observable<any>;
  submoduleId: string;
  workflowUsers: any[] = [];
  subscriptions: Subscription[] = [];
  currentUser: any;
  adminUsers: any[] = [];
  createdByUsers: any[] = [];

  // filters
  filterMenuCompany =  [
    {name: 'Sort by Acsending', status: 'idle', icon: 'fa fa-sort-alpha-asc fa-lg'},
    {name: 'Sort by Decsending', status: 'idle', icon: 'fa fa-sort-alpha-desc fa-lg'},
    {name: 'Sort by Latest', status: 'idle', icon: 'fa fa-calendar-check-o fa-lg'},
    {name: 'Sort by Oldest', status: 'idle', icon: 'fa fa-calendar-times-o fa-lg'}
  ];

  statusMenu = [
    {name: 'Active', status: 'idle', icon: ''},
    {name: 'Completed', status: 'idle', icon: ''},
    {name: 'In Progress', status: 'idle', icon: ''},
    {name: 'Draft', status: 'idle', icon: ''}
  ];

  constructor(private activatedRoute: ActivatedRoute, private workflowService: WorkflowsService, private auth: AuthService) {
    this.currentUser = this.auth.currentUserValue

    this.subscriptions.push(this.activatedRoute.params.subscribe(val => {
      this.submoduleId = val['id']
      setItem(StorageItem.workflowID, val['id'])
    }));
    

    this.submissionData = this.activatedRoute.params.pipe(
      switchMap(() => this.workflowService.getSubmissionFromSubModule(this.submoduleId))
    );

    this.subscriptions.push(this.submissionData.subscribe(val => {
      this.adminUsers = val?.flatMap(data => data?.subModuleId?.adminUsers);
      this.createdByUsers = val?.map(data => data?.subModuleId?.createdBy);
    }))
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
    if(submissionStatus === 4) {
      return 'Draft'
    }
    return 'Rejected'
  }

  checkIfUserisAdmin(): boolean {
    return this.adminUsers?.includes(this.currentUser?.id)
  }

  checkIfUserisCreator(): boolean {
    return this.createdByUsers?.includes(this.currentUser?.id)
  }

  getPendingOnUsers(value: any[]) {
    return value?.map(data => data?.fullName)
  }

  sendFilterValue(value: any) {
    console.log(value);
    //send api call here
  }

  trackByFn(index: number, item: any) {
    return item?.id
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(val => val.unsubscribe());
  }
 }
