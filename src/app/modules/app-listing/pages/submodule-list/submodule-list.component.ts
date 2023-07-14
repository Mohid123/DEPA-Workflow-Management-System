import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, map, pluck } from 'rxjs';
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

  constructor(
    private dashBoardService: DashboardService,
    private activatedRoute: ActivatedRoute,
    private transport: DataTransportService
  ) {
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
        this.transport.moduleID.next(val['moduleID'])
        this.moduleData = this.dashBoardService.getSubModuleByID(val['moduleID']);
      }
    })
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
 
}
