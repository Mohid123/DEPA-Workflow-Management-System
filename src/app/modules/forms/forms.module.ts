import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsRoutingModule } from './forms-routing.module';
import { FormsComponent } from './forms.component';
import { FormioModule } from '@formio/angular';
import { TuiTabsModule } from '@taiga-ui/kit';
import { TuiButtonModule } from '@taiga-ui/core';
import { ReactiveFormsModule } from '@angular/forms';
import { EditFormComponent } from './pages/edit-form/edit-form.component';
import { FormBuilderComponent } from './pages/form-builder/form-builder.component';
import { HeaderComponent } from 'src/app/standalone-components/header/header.component';
import { CustomMultiSelectComponent } from 'src/app/standalone-components/custom-multi-select/custom-multi-select.component';
import { MonacoEditorModule } from '@materia-ui/ngx-monaco-editor';

@NgModule({
  declarations: [
    FormsComponent,
    EditFormComponent,
    FormBuilderComponent
  ],
  imports: [
    CommonModule,
    FormsRoutingModule,
    FormioModule,
    TuiTabsModule,
    TuiButtonModule,
    HeaderComponent,
    ReactiveFormsModule,
    CustomMultiSelectComponent,
    MonacoEditorModule
  ]
})
export class FormsModule { }
