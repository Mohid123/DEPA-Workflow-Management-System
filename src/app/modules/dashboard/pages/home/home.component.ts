import { Component } from '@angular/core';
import { DashboardService } from '../../dashboard.service';
import { Observable } from 'rxjs';
@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent {
  dashboardApps: Observable<any>;

  constructor(private dashboard: DashboardService) {
    this.dashboardApps = this.dashboard.getDashboardApps();
  }

}
