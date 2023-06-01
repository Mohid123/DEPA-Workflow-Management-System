import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkflowsComponent } from './workflows.component';
import { ViewWorkflowComponent } from './view-workflow/view-workflow.component';
import { ViewSubmissionsComponent } from './view-submissions/view-submissions.component';
import { AddSubmissionComponent } from './add-submission/add-submission.component';
import { EmailSubmissionComponent } from './email-submission/email-submission.component';
import { AuthGuard } from '../auth/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: WorkflowsComponent,
    data: {breadcrumb:'Workflows'},
    children:[
      {
        path: 'view-workflow/:id',
        canActivate: [AuthGuard],
        component: ViewWorkflowComponent,
        data: {breadcrumb:'View Workflow'},
      },
      {
        path: 'view-submissions/:id',
        canActivate: [AuthGuard],
        component: ViewSubmissionsComponent,
        data: {breadcrumb:'View Submissions'},
      },
      {
        path: 'add-submission/:id',
        canActivate: [AuthGuard],
        component: AddSubmissionComponent,
        data: {breadcrumb:'Add Submission'},
      },
      {
        path: 'email-submission',
        component: EmailSubmissionComponent
      },
      {
        path: '',
        canActivate: [AuthGuard],
        component: WorkflowsComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkflowsRoutingModule { }
