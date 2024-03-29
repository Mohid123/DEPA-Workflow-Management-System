import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomPreloadingStrategyService } from 'src/core/core-services/preloading-strategy.service';
import { AuthGuard } from './modules/auth/guards/auth.guard';
import { SubmoduleGuard } from './modules/auth/guards/submodule.guard';
import { NotFoundComponent } from './standalone-components/not-found/not-found.component';
import { EmailSubmissionComponent } from './modules/workflows/email-submission/email-submission.component';

/**
 * Routes array which contains all modules to be lazy loaded
 */
const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'modules',
    data: {preload: true},
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/app-listing/app-listing.module').then(m => m.AppListingModule)
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
    path: 'email-submission',
    component: EmailSubmissionComponent
  },
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full'
  },
  {
    path: '**',
    component: NotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {preloadingStrategy: CustomPreloadingStrategyService, scrollPositionRestoration: 'enabled'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
