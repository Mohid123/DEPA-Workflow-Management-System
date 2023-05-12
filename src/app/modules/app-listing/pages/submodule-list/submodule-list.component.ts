import { Component, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, map, pluck, switchMap } from 'rxjs';
import { DashboardService } from 'src/app/modules/dashboard/dashboard.service';

@Component({
  templateUrl: './submodule-list.component.html',
  styleUrls: ['./submodule-list.component.scss']
})
export class SubmodulesListComponent {
  subModuleData: Observable<any>;
  moduleData: Observable<any>;
  moduleSlug: string;

  constructor(private dashBoardService: DashboardService, private activatedRoute: ActivatedRoute) {
    this.subModuleData = this.activatedRoute.params.pipe(
      pluck('name'),
      map(name => this.moduleSlug = name),
      switchMap((moduleSlug => this.dashBoardService.getSubModuleBySlugName(moduleSlug)))
    );
  }

  itemDeleted(value: boolean) {
    if(value == true) {
      this.subModuleData = this.dashBoardService.getSubModuleBySlugName(this.moduleSlug)
    }
  }
}
