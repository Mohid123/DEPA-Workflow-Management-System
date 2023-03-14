import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from 'src/app/modules/dashboard/services/dashboard.service';
import { map, Observable } from 'rxjs';
import { MenuCardComponent } from '../menu-card/menu-card.component';

@Component({
  selector: 'app-shared-menu',
  standalone: true,
  imports: [CommonModule, MenuCardComponent],
  templateUrl: './shared-menu.component.html',
  styleUrls: ['./shared-menu.component.scss']
})
export class SharedMenuComponent {
  consoleCategories$: Observable<any>;
  apps$: Observable<any>;

  constructor(private dashService: DashboardService) {
    this.consoleCategories$ = this.dashService.dashboardMenuItems.pipe(map((value: any) => value.consoleCategories));
    this.apps$ = this.dashService.dashboardMenuItems.pipe(map((value: any) => value.apps));
  }
}
