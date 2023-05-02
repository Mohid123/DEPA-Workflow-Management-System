import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TuiBreadcrumbsModule } from '@taiga-ui/kit';
import { DashboardService } from 'src/app/modules/dashboard/dashboard.service';
import { AuthService } from 'src/app/modules/auth/auth.service';
import { Subscription } from 'rxjs';

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

  constructor(public dashboardService: DashboardService, private auth: AuthService) {}

  logoutSession() {
    this.subscription.push(this.auth.logout().subscribe())
  }

  ngOnDestroy(): void {
    this.subscription.forEach(subs => subs.unsubscribe());
  }

}
