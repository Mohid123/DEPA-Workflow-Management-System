import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppListingRoutingModule } from './app-listing-routing.module';
import { AppListingComponent } from './app-listing.component';
import { HeaderComponent } from 'src/app/standalone-components/header/header.component';
import { FooterComponent } from 'src/app/standalone-components/footer/footer.component';
import { TableViewComponent } from 'src/app/standalone-components/table-view/table-view.component';
import { SearchBarComponent } from 'src/app/standalone-components/search-bar/search-bar.component';
import { AddSubmoduleComponent } from './pages/add-submodule/add-submodule.component';
import { TuiBadgedContentModule, TuiCarouselModule, TuiCheckboxLabeledModule, TuiDataListWrapperModule, TuiInputModule, TuiInputTagModule, TuiIslandModule, TuiMultiSelectModule, TuiPaginationModule, TuiProgressModule, TuiRadioLabeledModule, TuiSelectModule, TuiTabsModule } from '@taiga-ui/kit';
import { TuiButtonModule, TuiDataListModule, TuiHintModule, TuiLoaderModule, TuiSvgModule, TuiTextfieldControllerModule, TuiTooltipModule } from '@taiga-ui/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormioModule } from '@formio/angular';
import { FilterComponent } from 'src/app/standalone-components/filter/filter.component';
import { CustomMultiSelectComponent } from 'src/app/standalone-components/custom-multi-select/custom-multi-select.component';
import { EditSubmoduleComponent } from './pages/edit-submodule/edit-submodule.component';
import { SubmodulesListComponent } from './pages/submodule-list/submodule-list.component';
import { TableLoaderComponent } from 'src/app/skeleton-loaders/table-loader/table-loader.component';
import { SubmissionTableComponent } from 'src/app/standalone-components/submission-table/submission-table.component';
import { EditSubmissionComponent } from './pages/edit-submission/edit-submission.component';
import { MonacoEditorModule } from '@materia-ui/ngx-monaco-editor';
@NgModule({
  declarations: [
    AppListingComponent,
    SubmodulesListComponent,
    AddSubmoduleComponent,
    EditSubmoduleComponent,
    EditSubmissionComponent
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
    TuiMultiSelectModule,
    TuiSelectModule,
    ReactiveFormsModule,
    FormsModule,
    TuiButtonModule,
    FormioModule,
    TuiRadioLabeledModule,
    FilterComponent,
    CustomMultiSelectComponent,
    TuiTabsModule,
    TuiIslandModule,
    TuiCarouselModule,
    TuiPaginationModule,
    TuiProgressModule,
    TuiBadgedContentModule,
    TuiInputTagModule,
    TableLoaderComponent,
    TuiTooltipModule,
    TuiHintModule,
    TuiLoaderModule,
    SubmissionTableComponent,
    TuiSvgModule,
    TuiInputTagModule,
    TuiDataListModule,
    TuiCheckboxLabeledModule,
    MonacoEditorModule
  ]
})
export class AppListingModule { }
