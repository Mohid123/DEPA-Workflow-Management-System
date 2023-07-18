import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, map, pluck } from 'rxjs';
import { AuthService } from 'src/app/modules/auth/auth.service';
import { DashboardService } from 'src/app/modules/dashboard/dashboard.service';
import { DataTransportService } from 'src/core/core-services/data-transport.service';
import { StorageItem, getItem, setItem } from 'src/core/utils/local-storage.utils';

@Component({
  templateUrl: './submodule-list.component.html',
  styleUrls: ['./submodule-list.component.scss']
})
export class SubmodulesListComponent {
  subModuleData: Observable<any>;
  moduleData: Observable<any>;
  moduleSlug: string;
  limit: number = 7;
  page: number = 1;
  searchValue: FormControl = new FormControl();
  currentUser: any;
  userRoleCheckAdmin: any;
  userRoleCheckAny: any;

  constructor(
    private dashBoardService: DashboardService,
    private activatedRoute: ActivatedRoute,
    private transport: DataTransportService,
    private router: Router,
    private auth: AuthService
  ) {
    this.currentUser = this.auth.currentUserValue;
    this.userRoleCheckAdmin = this.auth.checkIfRolesExist('admin')
    this.userRoleCheckAny = this.auth.checkIfRolesExist('any')
    this.activatedRoute.params.pipe(
      pluck('name'),
      map(name => {
        setItem(StorageItem.moduleSlug, name);
        this.moduleSlug = name;
        return name
      })
    ).subscribe(val => {
      this.subModuleData = this.dashBoardService.getSubModuleByModuleSlug(val, this.limit, this.page)
    });

    this.activatedRoute.queryParams.subscribe(val => {
      if(val['moduleID']) {
        setItem(StorageItem.moduleID, val['moduleID']);
        this.transport.moduleID.next(val['moduleID']);
        this.moduleData = this.dashBoardService.getSubModuleByID(val['moduleID']);
      }
    })
  }

  addSubmissionRoute() {
    this.router.navigate([`/modules/${getItem(StorageItem.moduleSlug)}/add-submission`, this.transport.moduleID?.value])
  }

  checkIfUserisAdmin(value: any[]): boolean {
    return value?.map(data => data?.id).includes(this.currentUser?.id)
  }

  fetchFreshData(data: any) {
    if(data) {
      this.subModuleData = this.dashBoardService.getSubModuleByModuleSlug(getItem(StorageItem.moduleSlug), this.limit, 1);
      this.moduleData = this.dashBoardService.getSubModuleByID(getItem(StorageItem.moduleID))
    }
  }

  itemDeleted(value: boolean) {
    if(value == true) {
      this.subModuleData = this.dashBoardService.getSubModuleByModuleSlug(this.moduleSlug, this.limit, this.page)
    }
  }

  sendPagination(value: number) {
    if(value) {
      this.page = value
      this.subModuleData = this.dashBoardService.getSubModuleByModuleSlug(this.moduleSlug, this.limit, this.page)
    }
  }

  checkIfAdminUserIsOnFirstStep(value: any[]) {
    return value?.map(data => data?.id)?.includes(this.currentUser?.id)
  }
 
}
