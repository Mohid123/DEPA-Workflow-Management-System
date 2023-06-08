import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { DashboardService } from 'src/app/modules/dashboard/dashboard.service';

@Component({
  templateUrl: './submodule-details.component.html',
  styleUrls: ['./submodule-details.component.scss']
})
export class SubmoduleDetailsComponent implements OnDestroy {
  formTabs: any[] = [];
  activeIndex: number = 0;
  formWithWorkflow: any = [];
  carouselIndex = 0;

  items = [];
  subscriptions: Subscription[] = [];
  submoduleDetails: any;

  constructor(private dashboard: DashboardService, private activatedRoute: ActivatedRoute) {
    this.fetchAndPopulateData()
  }

  fetchAndPopulateData() {
    this.subscriptions.push(this.activatedRoute.params.subscribe(val => {
      if(val['name']) {
        this.dashboard.getSubModuleBySlugName(val['name']).subscribe((res: any) => {
          this.submoduleDetails = res;
          this.formWithWorkflow = res?.formIds;
          this.formTabs = res?.formIds?.map(forms => forms.title);
          this.items = res?.workFlowId?.stepIds?.map(data => {
            return {
              approvers: data?.approverIds?.map(appr => appr?.fullName),
              condition: data?.condition
            }
          })
        })
      }
    }))
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscr => subscr.unsubscribe());
  }
}
