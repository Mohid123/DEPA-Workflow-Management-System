import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomPreloadingStrategyService } from 'src/core/core-services/preloading-strategy.service';
import { AuthGuard } from './modules/auth/guards/auth.guard';
import { SubmoduleGuard } from './modules/auth/guards/submodule.guard';

const routes: Routes = [
  {
    path: 'auth',
    canActivate: [SubmoduleGuard],
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
    path: 'form-builder',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/form-builder/form-builder.module').then(m => m.FormBuilderModule)
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
