import { Component } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-appstore',
  templateUrl: './appstore.component.html',
  styleUrls: ['./appstore.component.scss']
})
export class AppstoreComponent {
  categories$: Observable<any>;
  consoleCategories$: Observable<any>;
  apps$: Observable<any>;

  appStoreApps$: Observable<any>;

  constructor(private dashService: DashboardService) {
    this.categories$ = this.dashService.dashboardMenuItems.pipe(map((value: any) => value.categories));
    this.consoleCategories$ = this.dashService.dashboardMenuItems.pipe(map((value: any) => value.consoleCategories));
    this.apps$ = this.dashService.dashboardMenuItems.pipe(map((value: any) => value.apps));
    this.appStoreApps$ = this.dashService.apps;
  }

  setActiveInactive(item: any) {
    this.categories$ = this.categories$.pipe(map((value: any) => {
      return this.loopOverItems(value, item.name)
    }));
    this.consoleCategories$ = this.consoleCategories$.pipe(map((value: any) => {
      return this.loopOverItems(value, item.name)
    }));
    this.apps$ = this.apps$.pipe(map((value: any) => {
      return this.loopOverItems(value, item.name)
    }))
  }

  loopOverItems(items: any, name: string) {
    for (let i = 0; i < items.length; i++) {
      if(items[i].name === name) {
        items[i].isActive = true
      }
      else {
        items[i].isActive = false;
      }
    }
    return items
  }
  
}
