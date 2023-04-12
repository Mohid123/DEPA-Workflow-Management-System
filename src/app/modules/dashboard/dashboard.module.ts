import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { HomeComponent } from './pages/home/home.component';
import { HeaderComponent } from 'src/app/standalone-components/header/header.component';
import { TuiButtonModule, TuiTextfieldControllerModule, TuiLoaderModule } from '@taiga-ui/core';
import { FooterComponent } from 'src/app/standalone-components/footer/footer.component';
import {TuiTableModule} from '@taiga-ui/addon-table';
import {TuiLetModule} from '@taiga-ui/cdk';
import { TuiInputModule, TuiPaginationModule, TuiTabsModule, TuiTextAreaModule, TuiMultiSelectModule, TuiDataListWrapperModule } from '@taiga-ui/kit';
import { PublishAppComponent } from './pages/publish-app/publish-app.component';
import { GridViewLoaderComponent } from 'src/app/skeleton-loaders/grid-view-loader/grid-view-loader.component';
import { GridSmallComponent } from 'src/app/standalone-components/grid-small-app/grid-small-app.component';
import { GridTopAppComponent } from 'src/app/standalone-components/grid-top-app/grid-top-app.component';
import { GridSideAppComponent } from 'src/app/standalone-components/grid-side-app/grid-side-app.component';
import { WorkflowChartComponent } from 'src/app/standalone-components/workflow-chart/workflow-chart.component';
import { DummyWorkflowComponent } from './pages/dummy-workflow/dummy-workflow.component';

@NgModule({
  declarations: [
    DashboardComponent,
    HomeComponent,
    PublishAppComponent,
    GridViewLoaderComponent,
    DummyWorkflowComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    HeaderComponent,
    TuiButtonModule,
    FooterComponent,
    TuiTableModule,
    TuiPaginationModule,
    TuiLetModule,
    TuiTabsModule,
    ReactiveFormsModule,
    FormsModule,
    TuiInputModule,
    TuiTextfieldControllerModule,
    TuiTextAreaModule,
    TuiMultiSelectModule,
    TuiDataListWrapperModule,
    TuiLoaderModule,
    GridSmallComponent,
    GridTopAppComponent,
    GridSideAppComponent,
    WorkflowChartComponent
  ]
})
export class DashboardModule { }
