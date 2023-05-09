import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppListingComponent } from './app-listing.component';
import { AddSubmoduleComponent } from './pages/add-submodule/add-submodule.component';
import { SubmoduleGuard } from '../auth/guards/submodule.guard';
import { EditSubmoduleComponent } from './pages/edit-submodule/edit-submodule.component';
import { SubmodulesListComponent } from './pages/submodule-list/submodule-list.component';

const routes: Routes = [
  {
    path: '',
    component: AppListingComponent,
    data: {breadcrumb:'SubModules'},
    children:[
      {
        path: 'submodules/:id',
        component: SubmodulesListComponent,
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
        redirectTo: 'home',
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
