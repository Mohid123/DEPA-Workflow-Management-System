import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { emailLoginForm } from 'src/app/forms-schema/forms';
import { DashboardService } from 'src/app/modules/dashboard/dashboard.service';

@Component({
  templateUrl: './submodule-details.component.html',
  styleUrls: ['./submodule-details.component.scss']
})
export class SubmoduleDetailsComponent implements OnDestroy {
  formTabs: any[] = [];
  activeIndex: number = 0;
  formWithWorkflow: any = [emailLoginForm];
  carouselIndex = 0;
  value = 30

  readonly items = [];
  subscriptions: Subscription[] = [];

  constructor(private dashboard: DashboardService, private activatedRoute: ActivatedRoute) {
    this.subscriptions.push(this.activatedRoute.params.subscribe(val => {
      if(val['name']) {
        this.dashboard.getSubModuleBySlugName(val['name']).subscribe(res => {
          console.log(res)
        })
      }
    }))
  }

  ngOnDestroy(): void {
    
  }
}
