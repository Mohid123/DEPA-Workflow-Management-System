import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormBuilderRoutingModule } from './form-builder-routing.module';
import { FormBuilderComponent } from './form-builder.component';
import { FormioModule } from '@formio/angular';


@NgModule({
  declarations: [
    FormBuilderComponent
  ],
  imports: [
    CommonModule,
    FormBuilderRoutingModule,
    FormioModule
  ]
})
export class FormBuilderModule { }
