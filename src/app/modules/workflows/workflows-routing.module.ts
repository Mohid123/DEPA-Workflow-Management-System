import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkflowsComponent } from './workflows.component';
import { ViewWorkflowComponent } from './view-workflow/view-workflow.component';
import { AddSubmissionComponent } from './add-submission/add-submission.component';
import { EmailSubmissionComponent } from './email-submission/email-submission.component';
import { AuthGuard } from '../auth/guards/auth.guard';
import { FormKeyResolver } from 'src/core/core-services/form-key-resolver.service';

const routes: Routes = [
  {
    path: '',
    component: WorkflowsComponent,
    // resolve: { breadcrumb: WorkflowResolver },
    children:[
      {
        path: 'add-submission/:id',
        canActivate: [AuthGuard],
        component: AddSubmissionComponent,
        data: { breadcrumb: 'Add Submission' },
      },
      {
        path: ':key/:id',
        canActivate: [AuthGuard],
        component: ViewWorkflowComponent,
        resolve: { breadcrumb: FormKeyResolver },
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
