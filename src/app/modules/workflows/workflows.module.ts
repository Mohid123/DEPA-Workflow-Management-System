import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkflowsRoutingModule } from './workflows-routing.module';
import { WorkflowsComponent } from './workflows.component';
import { ViewWorkflowComponent } from './view-workflow/view-workflow.component';
import { HeaderComponent } from 'src/app/standalone-components/header/header.component';
import { FooterComponent } from 'src/app/standalone-components/footer/footer.component';
import { FormioModule } from '@formio/angular';
import { TuiBadgeModule, TuiIslandModule, TuiProgressModule, TuiToggleModule } from '@taiga-ui/kit';
import { ReactiveFormsModule } from '@angular/forms';
import { TuiButtonModule, TuiSvgModule } from '@taiga-ui/core';


@NgModule({
  declarations: [
    WorkflowsComponent,
    ViewWorkflowComponent
  ],
  imports: [
    CommonModule,
    WorkflowsRoutingModule,
    HeaderComponent,
    FooterComponent,
    FormioModule,
    TuiProgressModule,
    TuiIslandModule,
    ReactiveFormsModule,
    TuiToggleModule,
    TuiBadgeModule,
    TuiSvgModule,
    TuiButtonModule
  ]
})
export class WorkflowsModule { }
