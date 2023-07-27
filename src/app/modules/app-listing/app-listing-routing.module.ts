import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppListingComponent } from './app-listing.component';
import { AddSubmoduleComponent } from './pages/add-submodule/add-submodule.component';
import { SubmoduleGuard } from '../auth/guards/submodule.guard';
import { EditSubmoduleComponent } from './pages/edit-submodule/edit-submodule.component';
import { SubmodulesListComponent } from './pages/submodule-list/submodule-list.component';
import { SubmoduleResolver } from '../../../core/core-services/resolver.service';
import { EditSubmissionComponent } from './pages/edit-submission/edit-submission.component';

const routes: Routes = [
  {
    path: '',
    component: AppListingComponent,
    resolve: { breadcrumb: SubmoduleResolver },
    children:[
      {
        path: ':name',
        component: SubmodulesListComponent,
        canActivate: [SubmoduleGuard]
      },
      {
        path: 'add-module/:id',
        component: AddSubmoduleComponent,
        data: {breadcrumb:'Add App'},
      },
      {
        path: 'edit-module/:id',
        component: EditSubmoduleComponent,
        data: {breadcrumb:'Edit App'},
      },
      {
        path: 'edit-submission/:id',
        component: EditSubmissionComponent,
        data: {breadcrumb:'Edit Submission'},
      },
      {
        path: ':name',
        data: {preload: true},
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
