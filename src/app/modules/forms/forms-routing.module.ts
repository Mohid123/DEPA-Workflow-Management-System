import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsComponent } from './forms.component';
import { FormBuilderComponent } from './pages/form-builder/form-builder.component';
import { EditFormComponent } from './pages/edit-form/edit-form.component';

const routes: Routes = [
  {
    path: '',
    component: FormsComponent,
    data: {breadcrumb: 'Forms'},
    children: [
      {
        path: 'form-builder',
        component: FormBuilderComponent,
        data: {breadcrumb:'Form builder'},
      },
      {
        path: 'edit-form/:id',
        component: EditFormComponent,
        data: {breadcrumb: 'Edit-Form'}
      },
      {
        path: '',
        redirectTo: 'form-builder',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FormsRoutingModule { }
