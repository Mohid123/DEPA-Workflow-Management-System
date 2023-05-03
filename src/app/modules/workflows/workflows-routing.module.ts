import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkflowsComponent } from './workflows.component';
import { ViewWorkflowComponent } from './view-workflow/view-workflow.component';

const routes: Routes = [
  {
    path: '',
    component: WorkflowsComponent,
    data: {breadcrumb:'Workflows'},
    children:[
      {
        path: 'view-workflow',
        component: ViewWorkflowComponent,
        data: {breadcrumb:'View Workflow'},
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
export class WorkflowsRoutingModule { }
