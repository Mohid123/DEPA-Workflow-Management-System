import { Component, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subject, Subscription } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { WorkflowsService } from 'src/app/modules/workflows/workflows.service';
import { AuthService } from 'src/app/modules/auth/auth.service';
import { DashboardService } from 'src/app/modules/dashboard/dashboard.service';
import { TuiButtonModule, TuiDropdownModule, TuiHostedDropdownModule } from '@taiga-ui/core';
import { FilterComponent } from '../filter/filter.component';
import { StorageItem, getItem } from 'src/core/utils/local-storage.utils';
import { TuiPaginationModule, TuiProgressModule } from '@taiga-ui/kit';
import { TableLoaderComponent } from 'src/app/skeleton-loaders/table-loader/table-loader.component';
import { TuiActiveZoneModule } from '@taiga-ui/cdk';
import { ColDef } from 'ag-grid-community';
import { AgGridModule } from 'ag-grid-angular';
import { ActionButtonRenderer } from './action-btns.component';

@Component({
  selector: 'app-submission-table',
  standalone: true,
  imports: [
    CommonModule,
    FilterComponent,
    TuiProgressModule,
    TuiPaginationModule,
    TableLoaderComponent,
    ReactiveFormsModule,
    TuiButtonModule,
    RouterModule,
    TuiHostedDropdownModule,
    TuiDropdownModule,
    TuiActiveZoneModule,
    AgGridModule,
    ActionButtonRenderer
  ],
  templateUrl: './submission-table.component.html',
  styleUrls: ['./submission-table.component.scss']
})
export class SubmissionTableComponent implements OnDestroy {
  @Input() submissionData: any;
  @Input() moduleData: Observable<any>;
  submoduleId: string;
  subscriptions: Subscription[] = [];
  currentUser: any;
  adminUsers: any[] = [];
  createdByUsers: any[] = [];
  page = 1;
  tableDataValue: any;
  limit: number = 10000;
  submoduleData: any;
  userRoleCheckAdmin: any;
  sendingDecision = new Subject<boolean>();
  currentStepId: string;
  columnDefs: ColDef[] = [
    {
      field: 'code',
      headerName: 'Code',
      filter: true,
      floatingFilter: true,
      sortable: true,
      resizable: true
    },
    {
      field: 'submissionStatus',
      headerName: 'Status',
      filter: true,
      floatingFilter: true,
      sortable: true,
      resizable: true
    },
    {
      field: 'lastActivityPerformedBy',
      headerName: 'Last Activity By',
      filter: true,
      floatingFilter: true,
      sortable: true,
      resizable: true
    },
    {
      field: 'pendingOnUsers',
      headerName: 'Pending With',
      filter: true,
      floatingFilter: true,
      sortable: true,
      resizable: true
    },
    {
      field: 'progress',
      headerName: 'Progress',
      filter: true,
      floatingFilter: true,
      sortable: true,
      resizable: true
    },
    {
      field: 'actions',
      headerName: 'Actions',
      cellRenderer: ActionButtonRenderer,
      width: 130
    },
  ];

  rowData = [];

  constructor(
    private workflowService: WorkflowsService,
    private auth: AuthService,
    private dashboard: DashboardService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.currentUser = this.auth.currentUserValue;
    this.userRoleCheckAdmin = this.auth.checkIfRolesExist('sysAdmin');
    this.activatedRoute.queryParams.subscribe(val => {
      if(val['moduleID']) {
        this.submoduleId = val['moduleID']
        this.fetchDataAndPopulate();
        this.moduleData = this.dashboard.getSubModuleByID(val['moduleID']);
      }
    });
    this.subscriptions.push(this.workflowService.actionComplete.subscribe(value => {
      if(value == true) {
        this.fetchDataAndPopulate()
        this.workflowService.actionComplete.emit(false)
      }
    }))
  }

  onGridReady(params) {
    params.api.sizeColumnsToFit();
  }

  checkViewButtonCondition(data: any) {
    if (this.currentUser && !this.currentUser.roles.includes('sysAdmin') && data.subModuleId.accessType == "disabled" && !data.workFlowUsers.includes(this.currentUser.id)) {
      return false;
    }
    return true;
  }

  fetchDataAndPopulate() {
    this.subscriptions.push(this.workflowService.getSubmissionFromSubModule(this.submoduleId, this.limit, this.page)
    .subscribe((val: any) => {
      this.submissionData = val;
      this.tableDataValue = val?.results;
      this.rowData = this.tableDataValue?.map(data => {
        return {
          id: data?.id,
          status: data?.status,
          code: data?.code,
          submissionStatus: this.showStatus(data?.submissionStatus),
          lastActivityPerformedBy: data?.summaryData?.lastActivityPerformedBy?.fullName,
          pendingOnUsers: data?.summaryData?.pendingOnUsers?.map(val => val?.fullName),
          progress: String(data?.summaryData?.progress) + '%',
          subModuleId: data?.subModuleId,
          activeStepUsers: data?.activeStepUsers,
          workflowStatus: data?.workflowStatus,
          workFlowUsers: data?.workFlowUsers
        }
      })
      this.createdByUsers = val?.results?.map(data => data?.subModuleId?.createdBy);
    }))
  }

  checkIfUserisAdmin(value: any[]): boolean {
    return value?.map(data => data?.id).includes(this.currentUser?.id)
  }

  checkIfUserIsFirstUser(value: any) {
    if(value[0]?.status == 'inProgress') {
      return value[0]?.activeUsers?.includes(this.currentUser?.id)
    }
  }

  checkIfUserisViewOnly(value: any[]): boolean {
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

  checkIfUserisApprovedUser(data: any) {
    return data?.flatMap(val => val.approvedUsers)?.includes(this.currentUser?.id)
  }

  checkIfUserisCreator(): boolean {
    return this.createdByUsers?.includes(this.currentUser?.id)
  }

  getPendingOnUsers(value: any[]) {
    return value?.map(data => data?.fullName)
  }

  addSubmissionRoute() {
    this.router.navigate([`/modules/${getItem(StorageItem.moduleSlug)}/add-submission`, this.submoduleId])
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(val => val.unsubscribe());
  }
}
