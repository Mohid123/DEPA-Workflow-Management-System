import { Component, Inject, OnDestroy } from '@angular/core';
import { DashboardService } from '../../dashboard.service';
import { Observable, Subscription } from 'rxjs';
import { TuiDialogContext, TuiDialogService } from '@taiga-ui/core';
import {PolymorpheusContent} from '@tinkoff/ng-polymorpheus';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/modules/auth/auth.service';
@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnDestroy {
  dashboardApps: Observable<any>;
  moduleId: string;
  subscription: Subscription[] = [];
  currentUser: any;

  constructor(private dashboard: DashboardService, @Inject(TuiDialogService) private readonly dialogs: TuiDialogService, private router: Router, private auth: AuthService) {
    this.currentUser = this.auth.currentUserValue;
    this.dashboardApps = this.dashboard.getDashboardApps();
  }

  showDialog(moduleID: string, content: PolymorpheusContent<TuiDialogContext>): void {
    if(moduleID) {
      this.moduleId = moduleID
      this.dialogs.open(content).subscribe();
    }
  }

  deleteModule() {
    this.subscription.push(this.dashboard.deleteSubModule(this.moduleId).subscribe((res: any) => {
      this.dashboardApps = this.dashboard.getDashboardApps();
    }));
  }

  ngOnDestroy(): void {
    this.subscription.forEach(value => value.unsubscribe());
  }

}
