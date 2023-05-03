import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, pluck, switchMap } from 'rxjs';
import { DashboardService } from 'src/app/modules/dashboard/dashboard.service';
@Component({
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.scss']
})
export class CompaniesComponent {
  subModuleData: Observable<any>;

  constructor(private dashBoardService: DashboardService, private activatedRoute: ActivatedRoute) {
    this.subModuleData = this.activatedRoute.params.pipe(
      pluck('id'),
      switchMap((moduleID => this.dashBoardService.getSubModuleByModule(moduleID)))
    );
  }
}
