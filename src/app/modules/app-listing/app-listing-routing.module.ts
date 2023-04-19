import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppListingComponent } from './app-listing.component';
import { CompaniesComponent } from './pages/companies/companies.component';
import { AddSubmoduleComponent } from './pages/add-submodule/add-submodule.component';
import { SubmoduleGuard } from '../auth/guards/submodule.guard';

const routes: Routes = [
  {
    path: '',
    component: AppListingComponent,
    data: {breadcrumb:'Modules'},
    children:[
      {
        path: 'companies',
        component: CompaniesComponent,
        canActivate: [SubmoduleGuard],
        data: {breadcrumb:'List of Submodules'},
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
