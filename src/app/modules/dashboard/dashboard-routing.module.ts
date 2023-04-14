import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { HomeComponent } from './pages/home/home.component';
import { PublishAppComponent } from './pages/publish-app/publish-app.component';
import { DummyWorkflowComponent } from './pages/dummy-workflow/dummy-workflow.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    data: {breadcrumb:'Dashboard'},
    children:[
      {
        path: 'home',
        component: HomeComponent,
        data: {breadcrumb:'Home'},
      },
      {
        path: 'publish-app',
        component: PublishAppComponent,
        data: {breadcrumb:'Pubish an App'},
      },
      {
        path: 'dummy-workflow',
        component: DummyWorkflowComponent,
        data: {breadcrumb:'Workflow'},
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
