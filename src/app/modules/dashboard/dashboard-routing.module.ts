import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { HomeComponent } from './pages/home/home.component';
import { PublishAppComponent } from './pages/publish-app/publish-app.component';
import { ModuleGuard } from '../auth/guards/module.guard';
import { CategoriesListComponent } from './pages/categories-list/categories-list.component';
import { UsersListComponent } from './pages/users-list/users-list.component';
import { CompaniesComponent } from './pages/companies/companies.component';
import { ProfileComponent } from './pages/profile/profile.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    data: {breadcrumb:'Dashboard'},
    children:[
      {
        path: 'home',
        component: HomeComponent,
        canActivate: [ModuleGuard],
        data: {breadcrumb:'Home'},
      },
      {
        path: 'create-edit-module',
        component: PublishAppComponent,
        data: {breadcrumb:'Create/Edit Module'},
      },
      {
        path: 'categories',
        component: CategoriesListComponent,
        data: {breadcrumb:'Categories'},
      },
      {
        path: 'users',
        component: UsersListComponent,
        data: {breadcrumb:'Users'},
      },
      {
        path: 'companies',
        component: CompaniesComponent,
        data: {breadcrumb:'Companies'},
      },
      {
        path: 'profile',
        component: ProfileComponent,
        data: {breadcrumb:'Profile'},
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }

// {
//   path: '**', pathMatch: 'full',
//   component: PagenotfoundComponent
// },
