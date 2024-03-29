import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { HomeComponent } from './pages/home/home.component';
import { HeaderComponent } from 'src/app/standalone-components/header/header.component';
import { TuiButtonModule, TuiHintModule, TuiLoaderModule, TuiTextfieldControllerModule, TuiTooltipModule } from '@taiga-ui/core';
import { FooterComponent } from 'src/app/standalone-components/footer/footer.component';
import {TuiTableModule, TuiTablePaginationModule} from '@taiga-ui/addon-table';
import { TuiLetModule } from '@taiga-ui/cdk';
import { TuiAvatarModule, TuiBadgedContentModule, TuiDataListWrapperModule, TuiInputTagModule, TuiPaginationModule, TuiTabsModule } from '@taiga-ui/kit';
import { GridViewLoaderComponent } from 'src/app/skeleton-loaders/grid-view-loader/grid-view-loader.component';
import { GridTopAppComponent } from 'src/app/standalone-components/grid-top-app/grid-top-app.component';
import { CustomMultiSelectComponent } from 'src/app/standalone-components/custom-multi-select/custom-multi-select.component';
import { FormioModule } from '@formio/angular';
import { CategoriesListComponent } from './pages/categories-list/categories-list.component';
import { UsersListComponent } from './pages/users-list/users-list.component';
import { CompaniesComponent } from './pages/companies/companies.component';
import { TrimDirective } from 'src/core/directives/trim.directive';
import { ProfileComponent } from './pages/profile/profile.component';
import { AgGridModule } from 'ag-grid-angular';

@NgModule({
  declarations: [
    DashboardComponent,
    HomeComponent,
    GridViewLoaderComponent,
    CategoriesListComponent,
    UsersListComponent,
    CompaniesComponent,
    ProfileComponent
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
    GridTopAppComponent,
    CustomMultiSelectComponent,
    FormioModule,
    TuiTableModule,
    TuiInputTagModule,
    TuiDataListWrapperModule,
    TuiTextfieldControllerModule,
    TuiTablePaginationModule,
    TrimDirective,
    TuiBadgedContentModule,
    TuiAvatarModule,
    TuiHintModule,
    TuiTooltipModule,
    AgGridModule
  ]
})
export class DashboardModule { }
