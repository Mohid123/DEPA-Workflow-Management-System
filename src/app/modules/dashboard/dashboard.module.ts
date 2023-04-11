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

@NgModule({
  declarations: [
    DashboardComponent,
    HomeComponent,
    PublishAppComponent,
    GridViewLoaderComponent
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
    TuiLoaderModule
  ]
})
export class DashboardModule { }
