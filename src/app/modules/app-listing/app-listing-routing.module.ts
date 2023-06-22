import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppListingComponent } from './app-listing.component';
import { AddSubmoduleComponent } from './pages/add-submodule/add-submodule.component';
import { SubmoduleGuard } from '../auth/guards/submodule.guard';
import { EditSubmoduleComponent } from './pages/edit-submodule/edit-submodule.component';
import { SubmodulesListComponent } from './pages/submodule-list/submodule-list.component';
import { SubmoduleDetailsComponent } from './pages/submodule-details/submodule-details.component';
import { StorageItem, getItem } from 'src/core/utils/local-storage.utils';

const routes: Routes = [
  {
    path: '',
    component: AppListingComponent,
    data: {breadcrumb: getItem(StorageItem.moduleSlug) + ' ' + '(submodules)'},
    children:[
      {
        path: ':name',
        component: SubmodulesListComponent,
        canActivate: [SubmoduleGuard]
      },
      {
        path: 'add-submodule/:id',
        component: AddSubmoduleComponent,
        data: {breadcrumb:'Add Submodule'},
      },
      {
        path: 'edit-submodule/:id',
        component: EditSubmoduleComponent,
        data: {breadcrumb:'Edit Submodule'},
      },
      {
        path: 'submodule-details/:name',
        component: SubmoduleDetailsComponent,
        data: {breadcrumb:'Submodule Details'},
      },
      {
        path: getItem(StorageItem.moduleSlug),
        loadChildren: () => import('../workflows/workflows.module').then(m => m.WorkflowsModule)
      },
      {
        path: '',
        component: AppListingComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppListingRoutingModule {
}
