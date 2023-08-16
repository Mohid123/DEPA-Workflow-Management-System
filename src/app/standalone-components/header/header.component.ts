import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { CommonModule, Location, NgOptimizedImage } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TuiAvatarModule, TuiBreadcrumbsModule } from '@taiga-ui/kit';
import { DashboardService } from 'src/app/modules/dashboard/dashboard.service';
import { AuthService } from 'src/app/modules/auth/auth.service';
import { Subscription } from 'rxjs';
import { TuiHintModule, TuiHostedDropdownModule } from '@taiga-ui/core';
import { StorageItem, getItem } from 'src/core/utils/local-storage.utils';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, RouterModule, TuiBreadcrumbsModule, TuiAvatarModule, TuiHintModule, TuiHostedDropdownModule],
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

  constructor(public dashboardService: DashboardService, private auth: AuthService, private router: Router, private location: Location) {
    this.currentRoute = this.router.url;
    this.currentUser = this.auth.currentUserValue;
    this.userRoleCheck = this.auth.checkIfRolesExist('sysAdmin')
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
    return Object.fromEntries([this.encodeQuery(`/modules/${getItem(StorageItem.moduleSlug)}?moduleID=${getItem(StorageItem.moduleID)}`).split('=')])
  }
  
  goBack() {
    this.location.back();
  }

  setString(value: string): string {
    return value?.replace(/[_-]/g, ' ')
  }

  ngOnDestroy(): void {
    this.subscription.forEach(subs => subs.unsubscribe());
  }

}
