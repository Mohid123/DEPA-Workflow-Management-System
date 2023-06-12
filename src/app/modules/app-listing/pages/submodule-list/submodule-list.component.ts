import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, map, pluck, switchMap } from 'rxjs';
import { DashboardService } from 'src/app/modules/dashboard/dashboard.service';
import { DataTransportService } from 'src/core/core-services/data-transport.service';
import { StorageItem, setItem } from 'src/core/utils/local-storage.utils';

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

  constructor(
    private dashBoardService: DashboardService,
    private activatedRoute: ActivatedRoute,
    private transport: DataTransportService
  ) {
    this.subModuleData = this.activatedRoute.params.pipe(
      pluck('name'),
      map(name => {
        setItem(StorageItem.moduleSlug, name);
        this.moduleSlug = name;
        return name
      }),
      switchMap((moduleSlug => this.dashBoardService.getSubModuleByModuleSlug(moduleSlug, this.limit, this.page)))
    );

    this.activatedRoute.queryParams.subscribe(val => {
      if(val['moduleID']) {
        setItem(StorageItem.moduleID, val['moduleID']);
        this.transport.moduleID.next(val['moduleID'])
      }
    })
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

  getSortType(value: any): string {
    if(value?.sortType == 'Sort by Latest') {
      return 'latest'
    }
    if(value?.sortType == 'Sort by Oldest') {
      return 'oldest'
    }
    if(value?.sortType == 'Sort by Descending') {
      return 'desc'
    }
    return 'asc'
  }

  sendFilters(value: any) {
    if(value) {
      const queryParams = {
        field: value?.applyOn == 'Submodule Code' ? 'subModuleCode': 'companyName',
        sortByTime: ['latest', 'oldest'].includes(this.getSortType(value)) == true ? this.getSortType(value) : undefined,
        sortBy: ['asc', 'desc'].includes(this.getSortType(value)) == true ? this.getSortType(value) : undefined,
      }
      if(queryParams.sortBy == undefined) {
        delete queryParams.sortBy
      }
      if(queryParams.sortByTime == undefined) {
        delete queryParams.sortByTime
      }
      console.log(queryParams)
      // this.subModuleData = this.dashBoardService.getSubModuleByModuleSlug(this.moduleSlug, this.limit, this.page, queryParams)
    }
  }

  sendSearchValue(value: any) {
    if(value) {
      const queryParams = {
        field: value?.searchBy == 'Submodule Code' ? 'subModuleCode': 'companyName',
        search: value?.search
      }
      console.log(queryParams)
      // this.subModuleData = this.dashBoardService.getSubModuleByModuleSlug(this.moduleSlug, this.limit, this.page, queryParams)
    }
  }
}
