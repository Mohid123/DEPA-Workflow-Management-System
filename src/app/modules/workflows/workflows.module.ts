import { NgModule } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';

import { WorkflowsRoutingModule } from './workflows-routing.module';
import { WorkflowsComponent } from './workflows.component';
import { ViewWorkflowComponent } from './view-workflow/view-workflow.component';
import { HeaderComponent } from 'src/app/standalone-components/header/header.component';
import { FooterComponent } from 'src/app/standalone-components/footer/footer.component';
import { FormioModule } from '@formio/angular';
import { TuiBadgeModule, TuiBadgedContentModule, TuiCarouselModule, TuiDataListWrapperModule, TuiInputTagModule, TuiIslandModule, TuiPaginationModule, TuiProgressModule, TuiTabsModule, TuiToggleModule } from '@taiga-ui/kit';
import { ReactiveFormsModule } from '@angular/forms';
import { TuiButtonModule, TuiHintModule, TuiLoaderModule, TuiSvgModule, TuiTextfieldControllerModule, TuiTooltipModule } from '@taiga-ui/core';
import { TableViewComponent } from 'src/app/standalone-components/table-view/table-view.component';
import { AddSubmissionComponent } from './add-submission/add-submission.component';
import { CustomMultiSelectComponent } from 'src/app/standalone-components/custom-multi-select/custom-multi-select.component';
import { EmailSubmissionComponent } from './email-submission/email-submission.component';
import { TableLoaderComponent } from 'src/app/skeleton-loaders/table-loader/table-loader.component';
import { FilterComponent } from 'src/app/standalone-components/filter/filter.component';
import { WorkflowSkeletonComponent } from 'src/app/skeleton-loaders/workflow-skeleton/workflow-skeleton.component';
import {TuiLegendItemModule, TuiRingChartModule} from '@taiga-ui/addon-charts';
import { TuiHoveredModule } from '@taiga-ui/cdk';


@NgModule({
  declarations: [
    WorkflowsComponent,
    ViewWorkflowComponent,
    AddSubmissionComponent,
    EmailSubmissionComponent
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
    TuiButtonModule,
    TuiTabsModule,
    TableViewComponent,
    TuiPaginationModule,
    CustomMultiSelectComponent,
    NgOptimizedImage,
    TuiLoaderModule,
    TuiCarouselModule,
    TuiInputTagModule,
    TuiDataListWrapperModule,
    TuiBadgedContentModule,
    TuiTextfieldControllerModule,
    TableLoaderComponent,
    FilterComponent,
    TuiHintModule,
    TuiTooltipModule,
    WorkflowSkeletonComponent
  ]
})
export class WorkflowsModule { }
