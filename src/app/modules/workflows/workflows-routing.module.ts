import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkflowsComponent } from './workflows.component';
import { ViewWorkflowComponent } from './view-workflow/view-workflow.component';
import { ViewSubmissionsComponent } from './view-submissions/view-submissions.component';
import { AddSubmissionComponent } from './add-submission/add-submission.component';
import { EmailSubmissionComponent } from './email-submission/email-submission.component';
import { AuthGuard } from '../auth/guards/auth.guard';
import { WorkflowResolver } from 'src/core/core-services/workflow-resolver.service';
import { FormKeyResolver } from 'src/core/core-services/form-key-resolver.service';

const routes: Routes = [
  {
    path: '',
    component: WorkflowsComponent,
    resolve: { breadcrumb: WorkflowResolver },
    children:[
      {
        path: ':submoduleCode/:key/:id',
        canActivate: [AuthGuard],
        component: ViewWorkflowComponent,
        resolve: { breadcrumb: FormKeyResolver },
      },
      {
        path: ':submoduleCode/:id',
        canActivate: [AuthGuard],
        component: ViewSubmissionsComponent,
      },
      {
        path: ':submoduleCode/add-submission/:id',
        canActivate: [AuthGuard],
        component: AddSubmissionComponent,
        data: { breadcrumb: 'Add Submission' },
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
