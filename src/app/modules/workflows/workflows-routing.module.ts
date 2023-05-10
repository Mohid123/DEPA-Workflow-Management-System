import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkflowsComponent } from './workflows.component';
import { ViewWorkflowComponent } from './view-workflow/view-workflow.component';
import { ViewSubmissionsComponent } from './view-submissions/view-submissions.component';
import { AddSubmissionComponent } from './add-submission/add-submission.component';

const routes: Routes = [
  {
    path: '',
    component: WorkflowsComponent,
    children:[
      {
        path: 'view-workflow/:id',
        component: ViewWorkflowComponent,
        data: {breadcrumb:'View Workflow'},
      },
      {
        path: 'view-submissions/:id',
        component: ViewSubmissionsComponent,
        data: {breadcrumb:'View Submissions'},
      },
      {
        path: 'add-submission/:id',
        component: AddSubmissionComponent,
        data: {breadcrumb:'Add Submission'},
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkflowsRoutingModule { }
