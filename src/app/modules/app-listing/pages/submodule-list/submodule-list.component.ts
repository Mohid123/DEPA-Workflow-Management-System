import { Component, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, map, pluck, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/modules/auth/auth.service';
import { DashboardService } from 'src/app/modules/dashboard/dashboard.service';
import { DataTransportService } from 'src/core/core-services/data-transport.service';
import { StorageItem, getItem, getItemSession, setItem, setItemSession } from 'src/core/utils/local-storage.utils';

@Component({
  templateUrl: './submodule-list.component.html',
  styleUrls: ['./submodule-list.component.scss']
})
export class SubmodulesListComponent implements OnDestroy {
  subModuleData: Observable<any>;
  moduleData: Observable<any>;
  moduleSlug: string;
  limit: number = 6;
  page: number = 1;
  searchValue: FormControl = new FormControl();
  currentUser: any;
  userRoleCheckAdmin: any;
  userRoleCheckUser: any;
  userRoleCheckSys: any;
  destroy$ = new Subject()

  constructor(
    private dashBoardService: DashboardService,
    private activatedRoute: ActivatedRoute,
    private transport: DataTransportService,
    private router: Router,
    private auth: AuthService
  ) {
    this.currentUser = this.auth.currentUserValue;
    this.userRoleCheckAdmin = this.auth.checkIfRolesExist('admin')
    this.userRoleCheckUser = this.auth.checkIfRolesExist('user')
    this.userRoleCheckSys = this.auth.checkIfRolesExist('sysAdmin')
    this.activatedRoute.params.pipe(
      pluck('name'),
      map(name => {
        setItemSession(StorageItem.moduleSlug, name);
        this.moduleSlug = name;
        return name
      }),
      takeUntil(this.destroy$)
    ).subscribe(val => {
      this.subModuleData = this.dashBoardService.getSubModuleByModuleSlug(val, this.limit, this.page)
    });

    this.activatedRoute.queryParams.pipe(takeUntil(this.destroy$)).subscribe(val => {
      if(val['moduleID']) {
        setItemSession(StorageItem.moduleID, val['moduleID']);
        this.transport.moduleID.next(val['moduleID']);
        this.moduleData = this.dashBoardService.getSubModuleByID(val['moduleID']);
      }
    })
  }

  /**
   * Method for checking if User has permissions
   * @param data Object
   * @returns boolean
   */
  checkAccess(data: any) {
    if (this.userRoleCheckSys == false && data?.accessType == "disabled" && !data?.submissionCreators.includes(this.currentUser?.id)) {
      return false;
    }
    return true;
  }

  /**
   * Method to check permissions for logged in user
   * @param data Object
   * @param adminUsers Array of admin users
   * @returns boolean
   */
  disableModify(data: any, adminUsers: any) {
    if(data == 'disabled') {
      return true
    }
    if(adminUsers?.length > 0 && adminUsers?.map(val => val?.id).includes(this.currentUser?.id)) {
      return true
    }
    return false
  }

  /**
   * Method to handle redirection to Add submission page
   */
  addSubmissionRoute() {
    this.router.navigate([`/modules/${getItemSession(StorageItem.moduleSlug)}/add-submission`, this.transport.moduleID?.value])
  }

  /**
   * Method to check if user is an app admin
   * @param value array<any>
   * @returns boolean
   */
  checkIfUserisAdmin(value: any[]): boolean {
    return value?.map(data => data?.id).includes(this.currentUser?.id)
  }

  /**
   * @ignore
   * @param data Object
   */
  fetchFreshData(data: any) {
    if(data) {
      this.subModuleData = this.dashBoardService.getSubModuleByModuleSlug(getItemSession(StorageItem.moduleSlug), this.limit, 1);
      this.moduleData = this.dashBoardService.getSubModuleByID(getItemSession(StorageItem.moduleID))
    }
  }

  /**
   * Called when the item to be deleted emits the deleted event
   * @param value boolean
   */
  itemDeleted(value: boolean) {
    if(value == true) {
      this.subModuleData = this.dashBoardService.getSubModuleByModuleSlug(this.moduleSlug, this.limit, this.page)
    }
  }

  /**
   * Method to handle pagination of data
   * @param value number
   */
  sendPagination(value: number) {
    if(value) {
      this.page = value
      this.subModuleData = this.dashBoardService.getSubModuleByModuleSlug(this.moduleSlug, this.limit, this.page)
    }
  }

  /**
   * Method to check if admin user is on first step
   * @param value array<any>
   * @returns boolean
   */
  checkIfAdminUserIsOnFirstStep(value: any[]) {
    return value?.map(data => data?.id)?.includes(this.currentUser?.id)
  }

  /**
   * Built in Angular Lifecycle method that is run when component or page is destroyed or removed from DOM
   */
  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

}
