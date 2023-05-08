import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppListingComponent } from './app-listing.component';
import { CompaniesComponent } from './pages/companies/companies.component';
import { AddSubmoduleComponent } from './pages/add-submodule/add-submodule.component';
import { SubmoduleGuard } from '../auth/guards/submodule.guard';
import { EditSubmoduleComponent } from './pages/edit-submodule/edit-submodule.component';

const routes: Routes = [
  {
    path: '',
    component: AppListingComponent,
    data: {breadcrumb:'Modules'},
    children:[
      {
        path: 'submodules/:id',
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
        path: 'edit-submodule/:id',
        component: EditSubmoduleComponent,
        data: {breadcrumb:'Edit Submodule'},
      },
      {
        path: '',
        redirectTo: 'submodules/:id',
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
