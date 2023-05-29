import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, map, pluck, switchMap } from 'rxjs';
import { DashboardService } from 'src/app/modules/dashboard/dashboard.service';
import { DataTransportService } from 'src/core/core-services/data-transport.service';

@Component({
  templateUrl: './submodule-list.component.html',
  styleUrls: ['./submodule-list.component.scss']
})
export class SubmodulesListComponent {
  subModuleData: Observable<any>;
  moduleData: Observable<any>;
  moduleSlug: string;

  constructor(private dashBoardService: DashboardService, private activatedRoute: ActivatedRoute, private transport: DataTransportService) {
    this.subModuleData = this.activatedRoute.params.pipe(
      pluck('name'),
      map(name => this.moduleSlug = name),
      switchMap((moduleSlug => this.dashBoardService.getSubModuleByModuleSlug(moduleSlug)))
    );

    this.activatedRoute.queryParams.subscribe(val => {
      if(val['moduleID']) {
        this.transport.moduleID.next(val['moduleID'])
      }
    })
  }

  itemDeleted(value: boolean) {
    if(value == true) {
      this.subModuleData = this.dashBoardService.getSubModuleByModuleSlug(this.moduleSlug)
    }
  }
}
