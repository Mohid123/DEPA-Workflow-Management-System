import { Component, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, map, pluck, switchMap } from 'rxjs';
import { DashboardService } from 'src/app/modules/dashboard/dashboard.service';

@Component({
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.scss']
})
export class CompaniesComponent {
  subModuleData: Observable<any>;
  moduleId: string;

  constructor(private dashBoardService: DashboardService, private activatedRoute: ActivatedRoute) {
    this.subModuleData = this.activatedRoute.params.pipe(
      pluck('id'),
      map(id => this.moduleId = id),
      switchMap((moduleID => this.dashBoardService.getSubModuleByModule(moduleID)))
    );
  }

  itemDeleted(value: boolean) {
    if(value == true) {
      this.subModuleData = this.dashBoardService.getSubModuleByModule(this.moduleId)
    }
  }
}
