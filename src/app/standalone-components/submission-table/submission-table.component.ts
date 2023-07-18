import { Component, Inject, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { WorkflowsService } from 'src/app/modules/workflows/workflows.service';
import { AuthService } from 'src/app/modules/auth/auth.service';
import { DashboardService } from 'src/app/modules/dashboard/dashboard.service';
import { TuiButtonModule, TuiDialogService } from '@taiga-ui/core';
import { FilterComponent } from '../filter/filter.component';
import { StorageItem, getItem, setItem } from 'src/core/utils/local-storage.utils';
import {  TuiPaginationModule, TuiProgressModule } from '@taiga-ui/kit';
import { TableLoaderComponent } from 'src/app/skeleton-loaders/table-loader/table-loader.component';

@Component({
  selector: 'app-submission-table',
  standalone: true,
  imports: [CommonModule, FilterComponent, TuiProgressModule, TuiPaginationModule, TableLoaderComponent, ReactiveFormsModule, TuiButtonModule, RouterModule],
  templateUrl: './submission-table.component.html',
  styleUrls: ['./submission-table.component.scss']
})
export class SubmissionTableComponent implements OnDestroy {
  @Input() submissionData: any;
  submoduleId: string;
  subscriptions: Subscription[] = [];
  currentUser: any;
  adminUsers: any[] = [];
  createdByUsers: any[] = [];
  destroy$ = new Subject();
  dialogTitle: string;
  searchValue: FormControl = new FormControl();

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
    {name: 'Cancelled', status: 'idle', icon: ''},
    {name: 'Deleted', status: 'idle', icon: ''}
  ];
  page = 1;
  tableDataValue: any;
  limit: number = 7;
  submoduleData: any;
  remarks = new FormControl('');
  userRoleCheckAny: any;

  constructor(
    private workflowService: WorkflowsService,
    private auth: AuthService,
    private dashboard: DashboardService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.currentUser = this.auth.currentUserValue;
    this.userRoleCheckAny = this.auth.checkIfRolesExist('any')
    this.activatedRoute.queryParams.subscribe(val => {
        if(val['moduleID']) {
          this.submoduleId = val['moduleID']
          this.subscriptions.push(this.dashboard.getSubModuleByID(this.submoduleId).subscribe(val => {
          this.submoduleData = val;
        }));
        this.fetchDataAndPopulate()
      }
    })
  }

  setWorkflowID(id: string) {
    setItem(StorageItem.workflowID, id)
  }

  fetchDataAndPopulate() {
    this.subscriptions.push(this.workflowService.getSubmissionFromSubModule(this.submoduleId, this.limit, this.page)
    .subscribe((val: any) => {
      this.submissionData = val;
      this.tableDataValue = val?.results;
      this.createdByUsers = val?.results?.map(data => data?.subModuleId?.createdBy);
    }))
  }

  checkIfUserisAdmin(value: any[]): boolean {
    return value?.map(data => data?.id).includes(this.currentUser?.id)
  }

  changeProgressColor(value: number) {
    if(value <= 49) {
      return '#F15B41'
    }
    if(value > 49 && value < 75) {
      return '#F9B71A'
    }
    if(value >= 75) {
      return '#32de84'
    }
    return '#fff'
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
    if(submissionStatus === 5) {
      return 'Cancelled'
    }
    if(submissionStatus === 6) {
      return 'Deleted'
    }
    return 'Rejected'
  }

  checkIfUserisPartofWorkflow(data: any) {
    return data?.map(val => val?._id)?.includes(this.currentUser?.id)
  }

  checkIfUserisActiveUser(data: any) {
    return data?.flatMap(val => val?.status == 'inProgress' ? val.activeUsers: null)?.filter(val => val).includes(this.currentUser?.id)
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
      case 'Cancelled':
        this.workflowService.getSubmissionFromSubModule(this.submoduleId, this.limit, this.page, 5)
        .pipe(takeUntil(this.destroy$))
        .subscribe((val: any) => {
          this.submissionData = val;
          this.tableDataValue = val?.results;
        })
        break
      case 'Deleted':
        this.workflowService.getSubmissionFromSubModule(this.submoduleId, this.limit, this.page, 6)
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

  addSubmissionRoute() {
    this.router.navigate([`/modules/${getItem(StorageItem.moduleSlug)}/add-submission`, this.submoduleId])
  }

  editWorkflowRoute(id: string, key: string) {
    setItem(StorageItem.formKey, key)
    this.router.navigate([`/modules`, getItem(StorageItem.moduleSlug), key, id])
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
    this.destroy$.complete();
    this.destroy$.unsubscribe();
    this.subscriptions.forEach(val => val.unsubscribe());
  }
}
