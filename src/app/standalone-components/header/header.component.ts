import { ChangeDetectionStrategy, Component, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location, NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TuiAvatarModule, TuiBadgedContentModule, TuiBreadcrumbsModule, TuiMarkerIconModule } from '@taiga-ui/kit';
import { DashboardService } from 'src/app/modules/dashboard/dashboard.service';
import { AuthService } from 'src/app/modules/auth/auth.service';
import { Subscription, Observable, Subject, takeUntil, take, isEmpty, of } from 'rxjs';
import { TuiButtonModule, TuiExpandModule, TuiHintModule, TuiHostedDropdownModule, TuiLoaderModule, TuiNotificationModule } from '@taiga-ui/core';
import { StorageItem, getItem, getItemSession, setItem, setItemSession } from 'src/core/utils/local-storage.utils';
import { TuiActiveZoneModule } from '@taiga-ui/cdk';
import {TuiSidebarModule} from '@taiga-ui/addon-mobile';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    TuiButtonModule,
    NgOptimizedImage,
    RouterModule,
    TuiBreadcrumbsModule,
    TuiAvatarModule,
    TuiHintModule,
    TuiHostedDropdownModule,
    TuiMarkerIconModule,
    TuiExpandModule,
    TuiSidebarModule,
    TuiActiveZoneModule,
    TuiNotificationModule,
    TuiBadgedContentModule,
    TuiLoaderModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnDestroy {
  /**
   * Array of subscriptions used for managing all observable subscriptions
   */
  subscription: Subscription[] = [];

  /**
   * The current path or route
   */
  currentRoute: any;

  /**
   * The currently logged in user
   */
  currentUser: any;

  /**
   * @ignore
   */
  open = false;

  /**
   * Used for checking the role of current user
   */
  userRoleCheck: any;

  /**
   * @ignore
   */
  path: any;

  /**
   * Used for managing the state of dropdown in tablet mode
   */
  expanded = false;

  /**
   * Boolean check for managing the state of the notifications panel
   */
  openSideNav = false;

  /**
   * Observable array carrying the pending submissions
   */
  pendingSubmissions: Observable<any>;

  /**
   * Loading spinner state manager
   */
  loader = new Subject<boolean>();

  /**
   * Subject for unsusbcribing from observables
   */
  destroy$ = new Subject();

  constructor(
    public dashboardService: DashboardService,
    private auth: AuthService,
    private router: Router,
    private location: Location,
    private ac: ActivatedRoute,
    private cf: ChangeDetectorRef
  ) {
    this.pendingSubmissions = this.dashboardService.getPendingSubmissions()
    this.dashboardService.submissionPendingDone.pipe(take(2), takeUntil(this.destroy$)).subscribe(res => {
      if(res == true) {
        this.pendingSubmissions = this.dashboardService.getPendingSubmissions();
        this.cf.detectChanges()
        this.dashboardService.submissionPendingDone.emit(false)
      }
    })
    this.currentRoute = this.router.url;
    this.currentUser = this.auth.currentUserValue;
    this.userRoleCheck = this.auth.checkIfRolesExist('sysAdmin');
  }

  /**
   * Used for changing the state of dropdown
   */
  toggle(): void {
    this.expanded = !this.expanded;
  }

  /**
   * Method for redirecting to submission/workflow page once a submission is selected
   * @param key submission key
   * @param id submission id
   * @param moduleSlug module key
   * @param moduleID module id
   */
  goToSubmissions(key: string, id: string, moduleSlug: string, moduleID: string) {
    this.loader.next(true)
    this.dashboardService.getSubModuleByModuleSlug(moduleSlug, 6, 1).subscribe(val => {
      if(val) {
        setItemSession(StorageItem.previewMode, false)
        setItemSession(StorageItem.moduleSlug, moduleSlug)
        setItemSession(StorageItem.moduleID, moduleID)
        setItemSession(StorageItem.formKey, key)
        setItemSession(StorageItem.formID, id)
        this.loader.next(false)
        this.toggleSideNav(false)
        this.router.navigate([`/modules`, moduleSlug || getItemSession(StorageItem.moduleSlug), key, id])
      }
    })
  }

  /**
   * Toggles the state of the side bar
   * @param openSideNav boolean for storing state of side bar
   */
  toggleSideNav(openSideNav: boolean) {
    this.openSideNav = openSideNav;
  }

  checkCurrentRouteIncludes() {
    return this.currentRoute.includes('moduleID')
  }

  /**
   * Logout of application
   */
  logoutSession() {
    this.subscription.push(this.auth.logout().subscribe())
  }

  /**
   * Encode string method and return the actual path of route
   * @param value a string value of the path
   * @returns the actual path of route without query parameters
   */
  encode(value: string) {
    return value.split('?')[0]
  }

  /**
   * Encode string method and return only the query parameters
   * @param value a string value of the path
   * @returns the query parameters
   */
  encodeQuery(value: string) {
    return value.split('?')[1]
  }

  /**
   * Method for handling the attachment of query params on specific routes
   * @returns url path as a string or null
   */
  finalQueryParams() {
    if(this.router.url.includes('add-submission') || this.router.url.includes('edit-submission') || this.router.url.includes('add-module') || this.router.url.includes(getItemSession(StorageItem.formID))) {
      return Object.fromEntries([this.encodeQuery(`/modules/${getItemSession(StorageItem.moduleSlug)}?moduleID=${getItemSession(StorageItem.moduleID)}`).split('=')])
    }
    if(this.router.url.includes('edit-module') && this.router.url.includes('moduleCode')) {
      return Object.fromEntries([this.encodeQuery(`/modules/${getItemSession(StorageItem.moduleSlug)}?moduleCode=${getItemSession(StorageItem.moduleSlug)}`).split('=')])
    }
    if(this.router.url.includes('fromSubmission')) {
      return Object.fromEntries([this.encodeQuery(`/modules/${getItemSession(StorageItem.moduleSlug)}?moduleID=${getItemSession(StorageItem.moduleID)}`).split('=')])
    }
    return null
  }

  /**
   * @ignore
   */
  goBack() {
    this.location.back();
  }

  /**
   * 
   * @param value string
   * @returns String without any extra characters that compromose the path integrity
   */
  setString(value: string): string {
    return value?.replace(/[_-]/g, ' ')
  }

  ngOnDestroy(): void {
    this.subscription.forEach(subs => subs.unsubscribe());
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

}
