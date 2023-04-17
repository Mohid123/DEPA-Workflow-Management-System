import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppListingRoutingModule } from './app-listing-routing.module';
import { AppListingComponent } from './app-listing.component';
import { CompaniesComponent } from './pages/companies/companies.component';
import { HeaderComponent } from 'src/app/standalone-components/header/header.component';
import { FooterComponent } from 'src/app/standalone-components/footer/footer.component';
import { TableViewComponent } from 'src/app/standalone-components/table-view/table-view.component';
import { SearchBarComponent } from 'src/app/standalone-components/search-bar/search-bar.component';
import { AddSubmoduleComponent } from './pages/add-submodule/add-submodule.component';
import { TuiDataListWrapperModule, TuiInputModule, TuiSelectModule } from '@taiga-ui/kit';
import { TuiButtonModule, TuiTextfieldControllerModule } from '@taiga-ui/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormioModule } from '@formio/angular';


@NgModule({
  declarations: [
    AppListingComponent,
    CompaniesComponent,
    AddSubmoduleComponent
  ],
  imports: [
    CommonModule,
    AppListingRoutingModule,
    HeaderComponent,
    FooterComponent,
    TableViewComponent,
    SearchBarComponent,
    TuiInputModule,
    TuiTextfieldControllerModule,
    TuiDataListWrapperModule,
    TuiSelectModule,
    ReactiveFormsModule,
    FormsModule,
    TuiButtonModule,
    FormioModule
  ]
})
export class AppListingModule { }
