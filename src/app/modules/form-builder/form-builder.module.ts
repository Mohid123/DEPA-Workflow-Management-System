import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormBuilderRoutingModule } from './form-builder-routing.module';
import { FormBuilderComponent } from './form-builder.component';
import { FormioModule } from '@formio/angular';
import { TuiTabsModule } from '@taiga-ui/kit';
import { TuiButtonModule } from '@taiga-ui/core';

@NgModule({
  declarations: [
    FormBuilderComponent
  ],
  imports: [
    CommonModule,
    FormBuilderRoutingModule,
    FormioModule,
    TuiTabsModule,
    TuiButtonModule,
  ]
})
export class FormBuilderModule { }
