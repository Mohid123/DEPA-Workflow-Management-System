import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppListingComponent } from './app-listing.component';
import { CompaniesComponent } from './pages/companies/companies.component';

const routes: Routes = [
  {
    path: '',
    component: AppListingComponent,
    data: {breadcrumb:'Modules'},
    children:[
      {
        path: '',
        component: CompaniesComponent,
        data: {breadcrumb:'Companies'},
      },
      {
        path: 'companies',
        component: CompaniesComponent,
        data: {breadcrumb:'Companies'},
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppListingRoutingModule { }
