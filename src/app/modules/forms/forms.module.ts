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
import { ViewFormsComponent } from './pages/view-forms/view-forms.component';

@NgModule({
  declarations: [
    FormsComponent,
    EditFormComponent,
    FormBuilderComponent,
    ViewFormsComponent
  ],
  imports: [
    CommonModule,
    FormsRoutingModule,
    FormioModule,
    TuiTabsModule,
    TuiButtonModule,
    ReactiveFormsModule
  ]
})
export class FormsModule { }
