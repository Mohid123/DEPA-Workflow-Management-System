import { ApplicationRef, Component } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { concat, filter, first, interval } from 'rxjs';
import { AuthService } from './modules/auth/auth.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { DashboardService } from './modules/dashboard/dashboard.service';

function promptUser(event: VersionReadyEvent): boolean {
  return true;
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'DEPA_FRONTEND';

  constructor(appRef: ApplicationRef, swUpdate: SwUpdate, private auth: AuthService, router: Router, private dashboardService: DashboardService, private activatedRoute: ActivatedRoute) {
    if(this.auth.currentUserValue) {
      router.navigate([window.location.pathname]);
    }
    
    router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(() => this.dashboardService.items = this.dashboardService.createBreadcrumbs(this.activatedRoute.root));

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
