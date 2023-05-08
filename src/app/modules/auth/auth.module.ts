import { NgModule } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { AuthComponent } from './auth.component';
import { LoginComponent } from './pages/login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TuiInputPasswordModule, TuiInputModule, TuiCheckboxModule } from '@taiga-ui/kit';
import { TuiButtonModule, TuiTextfieldControllerModule } from '@taiga-ui/core';
import { SubmoduleGuardComponent } from './templates/submodule-guard/submodule-guard.component';
import { FormioModule } from '@formio/angular';
import { ModuleGuardComponent } from './templates/module-guard/module-guard.component';

@NgModule({
  declarations: [
    AuthComponent,
    LoginComponent,
    SubmoduleGuardComponent,
    ModuleGuardComponent
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    TuiInputPasswordModule,
    TuiInputModule,
    TuiTextfieldControllerModule,
    NgOptimizedImage,
    TuiButtonModule,
    TuiCheckboxModule,
    FormioModule
  ]
})
export class AuthModule { }
