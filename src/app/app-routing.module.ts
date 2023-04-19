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
    canActivate: [SubmoduleGuard],
    loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path: 'form-builder',
    loadChildren: () => import('./modules/form-builder/form-builder.module').then(m => m.FormBuilderModule)
  },
  {
    path: 'appListing',
    loadChildren: () => import('./modules/app-listing/app-listing.module').then(m => m.AppListingModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {preloadingStrategy: CustomPreloadingStrategyService})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
