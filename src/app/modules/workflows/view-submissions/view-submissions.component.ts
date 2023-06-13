import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject, Subscription, map, pluck, switchMap, takeUntil } from 'rxjs';
import { WorkflowsService } from '../workflows.service';
import { StorageItem, setItem } from 'src/core/utils/local-storage.utils';
import { AuthService } from '../../auth/auth.service';
import { DashboardService } from '../../dashboard/dashboard.service';

@Component({
  templateUrl: './view-submissions.component.html',
  styleUrls: ['./view-submissions.component.scss']
})
export class ViewSubmissionsComponent implements OnDestroy {
  submissionData: any;
  submoduleId: string;
  workflowUsers: any[] = [];
  subscriptions: Subscription[] = [];
  currentUser: any;
  adminUsers: any[] = [];
  createdByUsers: any[] = [];
  destroy$ = new Subject();

  // filters
  filterMenuCompany =  [
    {name: 'Sort by Acsending', status: 'idle', icon: 'fa fa-sort-alpha-asc fa-lg'},
    {name: 'Sort by Decsending', status: 'idle', icon: 'fa fa-sort-alpha-desc fa-lg'},
    {name: 'Sort by Latest', status: 'idle', icon: 'fa fa-calendar-check-o fa-lg'},
    {name: 'Sort by Oldest', status: 'idle', icon: 'fa fa-calendar-times-o fa-lg'}
  ];

  statusMenu = [
    {name: 'Created', status: 'idle', icon: ''},
    {name: 'Completed', status: 'idle', icon: ''},
    {name: 'In Progress', status: 'idle', icon: ''},
    {name: 'Draft', status: 'idle', icon: ''},
    {name: 'Sort by Latest', status: 'idle', icon: ''},
    {name: 'Sort by Oldest', status: 'idle', icon: ''}
  ];

  page = 1;
  tableDataValue: any;
  limit: number = 7;
  submoduleData: any;

  constructor(private activatedRoute: ActivatedRoute, private workflowService: WorkflowsService, private auth: AuthService, private dashboard: DashboardService) {
    this.currentUser = this.auth.currentUserValue;

    this.subscriptions.push(this.activatedRoute.params.subscribe(val => {
      this.submoduleId = val['id']
      setItem(StorageItem.workflowID, val['id'])
    }));

    this.subscriptions.push(this.dashboard.getSubModuleByID(this.submoduleId).subscribe(val => {
      this.submoduleData = val;
      console.log(val)
    }))

    this.subscriptions.push(this.workflowService.getSubmissionFromSubModule(this.submoduleId, this.limit, this.page)
      .subscribe((val: any) => {
        this.submissionData = val;
        this.tableDataValue = val?.results;
        this.adminUsers = val?.results?.flatMap(data => data?.subModuleId?.adminUsers);
        this.createdByUsers = val?.results?.map(data => data?.subModuleId?.createdBy);
    }))
  }

  showStatus(submissionStatus: number): string {
    if(submissionStatus === 1) {
      return 'Created'
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
    switch (value?.sortType) {
      case 'Created':
        this.workflowService.getSubmissionFromSubModule(this.submoduleId, this.limit, this.page, 1)
          .pipe(takeUntil(this.destroy$))
          .subscribe((val: any) => {
            this.submissionData = val;
            this.tableDataValue = val?.results;
          })
        break
      case 'Completed':
        this.workflowService.getSubmissionFromSubModule(this.submoduleId, this.limit, this.page, 3)
          .pipe(takeUntil(this.destroy$))
          .subscribe((val: any) => {
            this.submissionData = val;
            this.tableDataValue = val?.results;
          })
        break
      case 'In Progress':
        this.workflowService.getSubmissionFromSubModule(this.submoduleId, this.limit, this.page, 2)
          .pipe(takeUntil(this.destroy$))
          .subscribe((val: any) => {
            this.submissionData = val;
            this.tableDataValue = val?.results;
          })
        break
      case 'Draft':
        this.workflowService.getSubmissionFromSubModule(this.submoduleId, this.limit, this.page, 4)
        .pipe(takeUntil(this.destroy$))
        .subscribe((val: any) => {
          this.submissionData = val;
          this.tableDataValue = val?.results;
        })
        break
      case 'Sort by Latest':
        this.workflowService.getSubmissionFromSubModule(this.submoduleId, this.limit, this.page, undefined, 'latest')
        .pipe(takeUntil(this.destroy$))
        .subscribe((val: any) => {
          this.submissionData = val;
          this.tableDataValue = val?.results;
        })
        break
      case 'Sort by Oldest':
        this.workflowService.getSubmissionFromSubModule(this.submoduleId, this.limit, this.page, undefined, 'oldest')
        .pipe(takeUntil(this.destroy$))
        .subscribe((val: any) => {
          this.submissionData = val;
          this.tableDataValue = val?.results;
        })
        break
    }
  }

  resetFilterValues(value: any) {
    if(value) {
      this.workflowService.getSubmissionFromSubModule(this.submoduleId, this.limit, this.page)
        .pipe(takeUntil(this.destroy$))
        .subscribe((val: any) => {
          this.submissionData = val;
          this.tableDataValue = val?.results;
      })
    }
  }

  trackByFn(index: number, item: any) {
    return item?.id
  }

    /**
   *
   * @param {number} index
   * Handles pagination of table data
   */
    goToPage(index: number): void {
      this.page = index + 1;
      this.workflowService.getSubmissionFromSubModule(this.submoduleId, this.limit, this.page)
        .pipe(takeUntil(this.destroy$))
        .subscribe((val: any) => {
          this.submissionData = val;
          this.tableDataValue = val?.results;
      })
    }

  ngOnDestroy(): void {
    this.subscriptions.forEach(val => val.unsubscribe());
  }
 }
