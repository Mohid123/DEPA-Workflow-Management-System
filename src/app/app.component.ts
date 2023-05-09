import { ApplicationRef, Component } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { concat, filter, first, interval } from 'rxjs';
import { AuthService } from './modules/auth/auth.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { DashboardService } from './modules/dashboard/dashboard.service';

/**
 * Monitors the event that is emitted when app updates and returns true
 * @param {VersionReadyEvent} event An event emitted when a new version of the app is available.
 * @returns {boolean} true | false based on provided condition
 */
function promptUser(event: VersionReadyEvent): boolean {
  return true;
}

/**
 * Main component of the application. Monitors the version of the application and updates app accordingly
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  /**
   * Project title
   */
  title = 'DEPA_FRONTEND';

  /**
   * Handles route redirect if user is authenticated and checks for updates
   * @param appRef A reference to an Angular application running on a page.
   * @param swUpdate Subscribe to update notifications from the Service Worker, trigger update checks, and forcibly activate updates.
   * @param auth Authentication Service
   * @param router A service that provides navigation among views and URL manipulation capabilities.
   * @param dashboardService Dashboard Service
   * @param activatedRoute Provides access to information about a route associated with a component that is loaded in an outlet.
   */
  constructor(appRef: ApplicationRef, swUpdate: SwUpdate, auth: AuthService, router: Router, private dashboardService: DashboardService, private activatedRoute: ActivatedRoute) {
    if(auth.currentUserValue && (window.location.pathname === '/' || window.location.pathname === '/auth/login')) {
      router.navigate(['/dashboard/home'])
    }

    router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(() => {
      const root = router.routerState.snapshot.root;
      const breadcrumbs: any[] = []; 
      this.dashboardService.createBreadcrumbs(root, [], breadcrumbs);
      this.dashboardService.items = breadcrumbs
    });

    const appIsStable$ = appRef.isStable.pipe(first(isStable => isStable === true));
    const everySixHours$ = interval(6 * 60 * 60 * 1000);
    const everySixHoursOnceAppIsStable$ = concat(appIsStable$, everySixHours$);
    everySixHoursOnceAppIsStable$.subscribe(async () => {
      try {
        const updateFound = await swUpdate.checkForUpdate();
        console.log(updateFound ? 'A new version is available.' : 'Already on the latest version.');
        if(updateFound) {
          document.location.reload();
        }
      } catch (err) {
        console.error('Failed to check for updates:', err);
      }
    });

    swUpdate.versionUpdates
    .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
    .subscribe(evt => {
      if (promptUser(evt)) {
        // Reload the page to update to the latest version.
        document.location.reload();
      }
    });
  }
}
