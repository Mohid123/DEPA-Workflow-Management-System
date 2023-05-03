import { Component, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AuthService } from '../../auth.service';
import { Subject, takeUntil, first, Observable } from 'rxjs';
import { NotificationsService } from 'src/core/core-services/notifications.service';
import { Router } from '@angular/router';
import { TuiNotification } from '@taiga-ui/core';
import { ApiResponse } from 'src/core/models/api-response.model';
import { activeDirectoryLoginForm, emailLoginForm } from 'src/app/forms/forms';

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnDestroy {
  isLoggingIn$: Observable<boolean> = this.auth.isLoading$;
  destroy$ = new Subject();
  userAuthData: any;
  loginViaActiveDir = new FormControl<boolean>(true);
  public emailLoginForm = emailLoginForm

  public activeDirectoryLoginForm = activeDirectoryLoginForm;

  options: any = {
    "disableAlerts": true
  }

  constructor(private auth: AuthService, private notif: NotificationsService, private router: Router) {}

  onSubmit(submission: any) {
    if(this.loginViaActiveDir?.value === true) {
      const params: any = {
        username: submission?.data?.username,
        password: submission?.data?.password
      }
      if(params.username && params.password) {
        this.auth.loginWithActiveDirectory(params).pipe(takeUntil(this.destroy$), first())
        .subscribe((res: ApiResponse<any>) => {
          if(!res.hasErrors()) {
            this.notif.displayNotification('Successfully authenticated', 'Login', TuiNotification.Success);
            this.router.navigate(['/dashboard/home'])
          }
        })
      }
    }
    else {
      const params: any = {
        email: submission?.data?.email,
        password: submission?.data?.password
      }
      if(params.email && params.password) {
        this.auth.login(params).pipe(takeUntil(this.destroy$), first())
        .subscribe((res: ApiResponse<any>) => {
          if(!res.hasErrors()) {
            this.notif.displayNotification('Successfully authenticated', 'Login', TuiNotification.Success);
            this.router.navigate(['/dashboard/home'])
          }
        })
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}

