import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppListingComponent } from './app-listing.component';
import { CompaniesComponent } from './pages/companies/companies.component';
import { AddSubmoduleComponent } from './pages/add-submodule/add-submodule.component';

const routes: Routes = [
  {
    path: '',
    component: AppListingComponent,
    data: {breadcrumb:'Modules'},
    children:[
      {
        path: 'companies',
        component: CompaniesComponent,
        data: {breadcrumb:'Companies'},
      },
      {
        path: 'add-submodule',
        component: AddSubmoduleComponent,
        data: {breadcrumb:'Add Submodule'},
      },
      {
        path: '',
        redirectTo: 'companies',
        pathMatch: 'full' 
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppListingRoutingModule { }
