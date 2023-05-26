import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { HomeComponent } from './pages/home/home.component';
import { PublishAppComponent } from './pages/publish-app/publish-app.component';
import { ModuleGuard } from '../auth/guards/module.guard';
import { CategoriesListComponent } from './pages/categories-list/categories-list.component';

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
        path: 'publish-app',
        component: PublishAppComponent,
        data: {breadcrumb:'Create new Module'},
      },
      {
        path: 'categories',
        component: CategoriesListComponent,
        data: {breadcrumb:'Categories'},
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
