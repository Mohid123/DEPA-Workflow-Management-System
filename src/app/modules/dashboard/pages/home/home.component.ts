import { Component, Inject, OnDestroy } from '@angular/core';
import { DashboardService } from '../../dashboard.service';
import { Observable, Subscription } from 'rxjs';
import { TuiDialogContext, TuiDialogService } from '@taiga-ui/core';
import {PolymorpheusContent} from '@tinkoff/ng-polymorpheus';
import { AuthService } from 'src/app/modules/auth/auth.service';
import { FormControl, Validators } from '@angular/forms';
@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnDestroy {
  dashboardApps: Observable<any>;
  moduleId: string;
  subscription: Subscription[] = [];
  currentUser: any;
  userRoleCheck: any;
  formData = new FormControl(null,
    Validators.compose([
      Validators.required
    ])
  )


  constructor(
    private dashboard: DashboardService,
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
    private auth: AuthService
  ) {
    this.currentUser = this.auth.currentUserValue;
    this.userRoleCheck = this.auth.checkIfRolesExist('admin');
    this.dashboardApps = this.dashboard.getDashboardApps();
  }

  showAddDialog(content: PolymorpheusContent<TuiDialogContext>) {
    this.dialogs.open(content, {
      dismissible: true,
      closeable: true
    }).subscribe();
  }

  addCategory() {
    const payload: {name: string} = {
      name: this.formData.value
    }
    this.subscription.push(this.dashboard.addCategory(payload)
    .subscribe(res => {
      if(res) {
        this.dashboardApps = this.dashboard.getDashboardApps();
      }
    }))
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
