import { Component, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subject, Subscription, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { WorkflowsService } from 'src/app/modules/workflows/workflows.service';
import { AuthService } from 'src/app/modules/auth/auth.service';
import { DashboardService } from 'src/app/modules/dashboard/dashboard.service';
import { TuiButtonModule, TuiHintModule, TuiHostedDropdownModule, TuiSvgModule, TuiTextfieldControllerModule } from '@taiga-ui/core';
import { FilterComponent } from '../filter/filter.component';
import { StorageItem, getItem, setItem } from 'src/core/utils/local-storage.utils';
import {  TuiCheckboxModule, TuiDataListWrapperModule, TuiInputModule, TuiPaginationModule, TuiProgressModule, TuiSelectModule } from '@taiga-ui/kit';
import { TableLoaderComponent } from 'src/app/skeleton-loaders/table-loader/table-loader.component';

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
    TuiCheckboxModule,
    TuiInputModule,
    TuiTextfieldControllerModule,
    TuiSvgModule,
    TuiDataListWrapperModule,
    TuiSelectModule,
    TuiHostedDropdownModule,
    TuiHintModule
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
  destroy$ = new Subject();
  dialogTitle: string;
  searchValue: FormControl = new FormControl();
  items = ['Display default', 'Display via View Schema'];
  open = false;
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
  showSchema: FormControl = new FormControl('Display default');
  userRoleCheckAdmin: any;
  showUpIcon = true;
  showDownIcon = false;
  tableHeaders: any[] = [
    {
      key: 'Code',
      searchKey: 'code',
      isVisible: new FormControl<boolean>(true),
      showUpIcon: true,
      showDownIcon: false,
      type: "text",
      search: new FormControl(null)
    },
    {
      key: 'Status',
      searchKey: 'submissionStatus',
      isVisible: new FormControl<boolean>(true),
      showUpIcon: true,
      showDownIcon: false,
      type: "text",
      search: new FormControl(null)
    },
    {
      key: 'Last Activity By',
      searchKey: 'lastActivityPerformedBy',
      isVisible: new FormControl<boolean>(true),
      showUpIcon: true,
      showDownIcon: false,
      type: "text",
      search: new FormControl(null)
    },
    {
      key: 'Now Pending With',
      searchKey: 'pendingOnUsers',
      isVisible: new FormControl<boolean>(true),
      showUpIcon: true,
      showDownIcon: false,
       type: "text",
      search: new FormControl(null)
    },
    {
      key: 'Progress',
      searchKey: 'progress',
      isVisible: new FormControl<boolean>(true),
      showUpIcon: true,
      showDownIcon: false,
      type: "number",
      search: new FormControl(null)
    }
  ];
  summaryData: any

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
        this.moduleData.subscribe(val => {
          if(val.viewSchema?.length == 0) {
            this.items = ['Display default']
          }
        })
      }
    });

    // switch schemas
    this.showSchema.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(val => {
      if(val == 'Display default') {
        this.tableHeaders = [
          {
            key: 'Code',
            searchKey: 'code',
            isVisible: new FormControl<boolean>(true),
            showUpIcon: true,
            showDownIcon: false,
            type: "text",
            search: new FormControl(null)
          },
          {
            key: 'Status',
            searchKey: 'submissionStatus',
            isVisible: new FormControl<boolean>(true),
            showUpIcon: true,
            showDownIcon: false,
            type: "text",
            search: new FormControl(null)
          },
          {
            key: 'Last Activity By',
            searchKey: 'lastActivityPerformedBy',
            isVisible: new FormControl<boolean>(true),
            showUpIcon: true,
            showDownIcon: false,
            type: "text",
            search: new FormControl(null)
          },
          {
            key: 'Now Pending With',
            searchKey: 'pendingOnUsers',
            isVisible: new FormControl<boolean>(true),
            showUpIcon: true,
            showDownIcon: false,
            type: "text",
            search: new FormControl(null)
          },
          {
            key: 'Progress',
            searchKey: 'progress',
            isVisible: new FormControl<boolean>(true),
            showUpIcon: true,
            showDownIcon: false,
            type: "number",
            search: new FormControl(null)
          }
        ];
        this.fetchDataAndPopulate()
      }
      if(val == 'Display via View Schema') {
        this.subscriptions.push(this.dashboard.getSubModuleByID(this.submoduleId).subscribe(val => {
          this.submoduleData = val;
          let tableKeys = this.submoduleData?.viewSchema?.map((data, index) => {
            return {
              key: data?.displayAs,
              field: data?.fieldKey,
              formKey: data?.formKey,
              searchKey: data.fieldKey,
              isVisible: index < 4 ? new FormControl<boolean>(true) :  new FormControl<boolean>(false),
              showUpIcon: true,
              showDownIcon: false,
              type: data?.type,
              search: new FormControl(null)
            }
          });
          this.tableHeaders = tableKeys;
          this.tableHeaders.forEach(header => {
            if (header.search) {
              header.search.valueChanges.pipe(
                debounceTime(400),
                distinctUntilChanged(),
                takeUntil(this.destroy$))
              .subscribe(value => {
                let payload: any
                if(value) {
                  if(["lastActivityPerformedBy", "pendingOnUsers"].includes(header?.searchKey)) {
                    payload = {
                      summaryData: {
                        [header?.searchKey]: {
                          fullName: value
                        }
                      }
                    }
                  }
                  if(header?.searchKey == "progress") {
                    payload = {
                      summaryData: {
                        [header?.searchKey]: Number(value)
                      }
                    }
                  }
                  if(!["lastActivityPerformedBy", "pendingOnUsers", "progress"].includes(header?.searchKey)) {
                   if(header?.type == "Number") {
                     let forms = [];
                     forms.push({
                      key: header?.field,
                      value: Number(header?.search?.value)
                     })
                      payload = {
                        summaryData: {
                          forms: forms
                        }
                      }
                   }
                   else {
                    let forms = [];
                     forms.push({
                      key: header?.field,
                      value: header?.search?.value
                     })
                      payload = {
                        summaryData: {
                          forms: forms
                        }
                      }
                   }
                  }
                }
                else {
                  payload = {}
                }
                this.sendSearchCallForFilters(payload)
              });
            }
          });
        }));
      }
    })
  }

  setWorkflowID(key: string, submissionID: string) {
    setItem(StorageItem.formKey, key)
    setItem(StorageItem.editSubmissionId, submissionID)
  }

  fetchDataAndPopulate() {
    this.subscriptions.push(this.workflowService.getSubmissionFromSubModule(this.submoduleId, this.limit, this.page)
    .subscribe((val: any) => {
      this.submissionData = val;
      this.tableDataValue = val?.results?.map(data => {
        return {
          ...data,
          isVisible: true
        }
      });
      this.createdByUsers = val?.results?.map(data => data?.subModuleId?.createdBy);
      this.tableHeaders.forEach(header => {
        if (header.search) {
          header.search.valueChanges.pipe(
            debounceTime(400),
            distinctUntilChanged())
          .subscribe(value => {
            let payload: any
            if(value) {
              if(["lastActivityPerformedBy", "pendingOnUsers"].includes(header?.searchKey)) {
                payload = {
                  summaryData: {
                    [header?.searchKey]: {
                      fullName: value
                    }
                  }
                }
              }
              if(header?.searchKey == "progress") {
                payload = {
                  summaryData: {
                    [header?.searchKey]: Number(value)
                  }
                }
              }
              if(header?.searchKey == "code") {
                debugger
                payload = {
                  [header?.searchKey]: value
                }
              }
              if(!["lastActivityPerformedBy", "pendingOnUsers", "progress", "code"].includes(header?.searchKey)) {
                payload = {
                  summaryData: {
                    [header?.searchKey]: value
                  }
                }
              }
            }
            else {
              payload = {}
            }
            this.sendSearchCallForFilters(payload)
          });
        }
      });
    }))
  }

  sendSearchCallForFilters(payload: any) {
    this.workflowService.getSubmissionFromSubModule(this.submoduleId, this.limit, this.page, undefined, undefined, undefined, payload)
    .pipe(takeUntil(this.destroy$)).subscribe((val: any) => {
      this.submissionData = val;
      this.tableDataValue = val?.results?.map(data => {
        return {
          ...data,
          isVisible: true
        }
      });
      this.createdByUsers = val?.results?.map(data => data?.subModuleId?.createdBy);
    })
  }

  fetchSummaryDataForValues(index: number, key: any) {
    this.subscriptions.push(this.workflowService.getSubmissionFromSubModule(this.submoduleId, this.limit, this.page)
    .subscribe((val: any) => {
      this.summaryData = val.results[index]?.summaryData;
      this.bindValueFromSummaryData(this.summaryData, key)
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

  bindValueFromSummaryData(obj: any, headerKey: string) {
    const matchingField = this.tableHeaders.find(data => data.field === headerKey);
    if (matchingField) {
      let key = matchingField?.key.split(' ')?.map(val => val.toLowerCase()).join('-')
      return obj[key]
    }
    return "";
  }

  sendFilterValue(event: any) {
    switch (Number(event?.target?.value)) {
      case 0:
        this.workflowService.getSubmissionFromSubModule(this.submoduleId, this.limit, this.page)
          .pipe(takeUntil(this.destroy$))
          .subscribe((val: any) => {
            this.submissionData = val;
            this.tableDataValue = val?.results;
          })
        break
      case 1:
        this.workflowService.getSubmissionFromSubModule(this.submoduleId, this.limit, this.page, 1)
          .pipe(takeUntil(this.destroy$))
          .subscribe((val: any) => {
            this.submissionData = val;
            this.tableDataValue = val?.results;
          })
        break
      case 3:
        this.workflowService.getSubmissionFromSubModule(this.submoduleId, this.limit, this.page, 3)
          .pipe(takeUntil(this.destroy$))
          .subscribe((val: any) => {
            this.submissionData = val;
            this.tableDataValue = val?.results;
          })
        break
      case 2:
        this.workflowService.getSubmissionFromSubModule(this.submoduleId, this.limit, this.page, 2)
          .pipe(takeUntil(this.destroy$))
          .subscribe((val: any) => {
            this.submissionData = val;
            this.tableDataValue = val?.results;
          })
        break
      case 4:
        this.workflowService.getSubmissionFromSubModule(this.submoduleId, this.limit, this.page, 4)
        .pipe(takeUntil(this.destroy$))
        .subscribe((val: any) => {
          this.submissionData = val;
          this.tableDataValue = val?.results;
        })
        break
      case 5:
        this.workflowService.getSubmissionFromSubModule(this.submoduleId, this.limit, this.page, 5)
        .pipe(takeUntil(this.destroy$))
        .subscribe((val: any) => {
          this.submissionData = val;
          this.tableDataValue = val?.results;
        })
        break
      case 6:
        this.workflowService.getSubmissionFromSubModule(this.submoduleId, this.limit, this.page, 6)
          .pipe(takeUntil(this.destroy$))
          .subscribe((val: any) => {
            this.submissionData = val;
            this.tableDataValue = val?.results;
          })
        break
    }
  }

  searchViaFilter(value: any) {
    console.log(value)
  }

  sortFields(key: string, sortBy: string, index: number) {
    if(sortBy == 'asc') {
      this.workflowService.getSubmissionFromSubModule(this.submoduleId, this.limit, this.page, undefined, key, 'asc')
      .pipe(takeUntil(this.destroy$)).subscribe((val: any) => {
        this.submissionData = val;
        this.tableDataValue = val?.results?.map(data => {
          return {
            ...data,
            isVisible: true
          }
        });
      this.createdByUsers = val?.results?.map(data => data?.subModuleId?.createdBy);
      })
      this.tableHeaders[index].showUpIcon = false;
      this.tableHeaders[index].showDownIcon = true;
    }
    if(sortBy == 'desc') {
      this.workflowService.getSubmissionFromSubModule(this.submoduleId, this.limit, this.page, undefined, key)
      .pipe(takeUntil(this.destroy$)).subscribe((val: any) => {
        this.submissionData = val;
        this.tableDataValue = val?.results?.map(data => {
          return {
            ...data,
            isVisible: true
          }
        });
        this.createdByUsers = val?.results?.map(data => data?.subModuleId?.createdBy);
      })
      this.tableHeaders[index].showUpIcon = true;
      this.tableHeaders[index].showDownIcon = false;
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
    setItem(StorageItem.formID, id)
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
