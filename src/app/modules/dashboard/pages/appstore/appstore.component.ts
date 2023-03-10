import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-appstore',
  templateUrl: './appstore.component.html',
  styleUrls: ['./appstore.component.scss']
})
export class AppstoreComponent {
  appStoreApps$: Observable<any>;

  constructor(private dashService: DashboardService) {
    this.appStoreApps$ = this.dashService.apps;
  }
}
