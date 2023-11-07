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
  subscription: Subscription[] = [];
  currentRoute: any;
  currentUser: any;
  open = false;
  userRoleCheck: any;
  path: any;
  expanded = false;
  openSideNav = false;
  pendingSubmissions: Observable<any>;
  loader = new Subject<boolean>();
  destroy$ = new Subject();
  private initialized = false;

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

  toggle(): void {
    this.expanded = !this.expanded;
  }

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

  toggleSideNav(openSideNav: boolean) {
    this.openSideNav = openSideNav;
  }

  checkCurrentRouteIncludes() {
    return this.currentRoute.includes('moduleID')
  }

  logoutSession() {
    this.subscription.push(this.auth.logout().subscribe())
  }

  encode(value: string) {
    return value.split('?')[0]
  }

  encodeQuery(value: string) {
    return value.split('?')[1]
  }

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

  goBack() {
    this.location.back();
  }

  setString(value: string): string {
    return value?.replace(/[_-]/g, ' ')
  }

  ngOnDestroy(): void {
    this.subscription.forEach(subs => subs.unsubscribe());
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

}
