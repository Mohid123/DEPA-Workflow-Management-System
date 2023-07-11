import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, map, pluck, switchMap } from 'rxjs';
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
    private transport: DataTransportService,
    private router: Router
  ) {
    let param: string = getItem(StorageItem.workflowID) || '';
    let moduleSlug = getItem(StorageItem.moduleSlug);
    let submoduleSlug = getItem(StorageItem.subModuleSlug)
    if(this.router.url == `/modules/${moduleSlug}`) {
      this.router.navigate([`/modules/${moduleSlug}/${submoduleSlug}`, param])
    }

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
        this.moduleData = this.dashBoardService.getSubModuleByID(val['moduleID'])
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
 
}
