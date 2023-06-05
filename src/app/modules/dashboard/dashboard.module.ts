import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { HomeComponent } from './pages/home/home.component';
import { HeaderComponent } from 'src/app/standalone-components/header/header.component';
import { TuiButtonModule, TuiLoaderModule, TuiTextfieldControllerModule } from '@taiga-ui/core';
import { FooterComponent } from 'src/app/standalone-components/footer/footer.component';
import {TuiTableModule, TuiTablePaginationModule} from '@taiga-ui/addon-table';
import { TuiLetModule } from '@taiga-ui/cdk';
import { TuiDataListWrapperModule, TuiInputTagModule, TuiPaginationModule, TuiTabsModule } from '@taiga-ui/kit';
import { PublishAppComponent } from './pages/publish-app/publish-app.component';
import { GridViewLoaderComponent } from 'src/app/skeleton-loaders/grid-view-loader/grid-view-loader.component';
import { GridSmallComponent } from 'src/app/standalone-components/grid-small-app/grid-small-app.component';
import { GridTopAppComponent } from 'src/app/standalone-components/grid-top-app/grid-top-app.component';
import { GridSideAppComponent } from 'src/app/standalone-components/grid-side-app/grid-side-app.component';
import { CustomMultiSelectComponent } from 'src/app/standalone-components/custom-multi-select/custom-multi-select.component';
import { FormioModule } from '@formio/angular';
import { CategoriesListComponent } from './pages/categories-list/categories-list.component';
import { UsersListComponent } from './pages/users-list/users-list.component';
import { CompaniesComponent } from './pages/companies/companies.component';
import { TrimDirective } from 'src/core/directives/trim.directive';

@NgModule({
  declarations: [
    DashboardComponent,
    HomeComponent,
    PublishAppComponent,
    GridViewLoaderComponent,
    CategoriesListComponent,
    UsersListComponent,
    CompaniesComponent
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
    TuiLoaderModule,
    GridSmallComponent,
    GridTopAppComponent,
    GridSideAppComponent,
    CustomMultiSelectComponent,
    FormioModule,
    TuiTableModule,
    TuiInputTagModule,
    TuiDataListWrapperModule,
    TuiTextfieldControllerModule,
    TuiTablePaginationModule,
    TrimDirective
  ]
})
export class DashboardModule { }
