import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { TuiBreadcrumbsModule } from '@taiga-ui/kit';
import { DashboardService } from 'src/app/modules/dashboard/dashboard.service';
import { AuthService } from 'src/app/modules/auth/auth.service';
import { Subscription, filter } from 'rxjs';
import { NavigationService } from 'src/core/core-services/navigation.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, RouterModule, TuiBreadcrumbsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnDestroy {
  subscription: Subscription[] = [];
  currentRoute: any;

  constructor(public dashboardService: DashboardService, private auth: AuthService, private router: Router, public nav: NavigationService) {
    this.currentRoute = this.router.url;
  }

  logoutSession() {
    this.subscription.push(this.auth.logout().subscribe())
  }

  ngOnDestroy(): void {
    this.subscription.forEach(subs => subs.unsubscribe());
  }

}
