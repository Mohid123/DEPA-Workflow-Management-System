import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { AppListingComponent } from './pages/app-listing/app-listing.component';
import { AppstoreComponent } from './pages/appstore/appstore.component';
import { PublishAppComponent } from './pages/publish-app/publish-app.component';

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
      },
      {
        path: 'publish-app',
        component: PublishAppComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
