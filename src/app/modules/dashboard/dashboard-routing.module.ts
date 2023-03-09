import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { AppListingComponent } from './pages/app-listing/app-listing.component';
import { AppstoreComponent } from './pages/appstore/appstore.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children:[
      {
        path: '',
        component: AppstoreComponent
      },
      {
        path: 'appStore',
        component: AppstoreComponent
      },
      {
        path: 'appList',
        component: AppListingComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
