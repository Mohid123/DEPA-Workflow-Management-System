import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomPreloadingStrategyService } from 'src/core/core-services/preloading-strategy.service';
import { AuthGuard } from './modules/auth/guards/auth.guard';
import { SubmoduleGuard } from './modules/auth/guards/submodule.guard';
import { ModuleGuard } from './modules/auth/guards/module.guard';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard, SubmoduleGuard],
    loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path: 'forms',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/forms/forms.module').then(m => m.FormsModule)
  },
  {
    path: 'appListing',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/app-listing/app-listing.module').then(m => m.AppListingModule)
  },
  {
    path: 'workflows',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/workflows/workflows.module').then(m => m.WorkflowsModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {preloadingStrategy: CustomPreloadingStrategyService, scrollPositionRestoration: 'enabled'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
