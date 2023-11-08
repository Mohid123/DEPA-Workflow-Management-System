import { Component, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AuthService } from '../../auth.service';
import { Subject, takeUntil, first, Observable, BehaviorSubject } from 'rxjs';
import { NotificationsService } from 'src/core/core-services/notifications.service';
import { Router, ActivatedRoute } from '@angular/router';
import { TuiNotification } from '@taiga-ui/core';
import { ApiResponse } from 'src/core/models/api-response.model';
import { activeDirectoryLoginForm, emailLoginForm } from 'src/app/forms-schema/forms';

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnDestroy {
  isLoggingIn$: Observable<boolean> = this.auth.isLoading$;
  destroy$ = new Subject();
  credentialStore = new BehaviorSubject<any>({})
  userAuthData: any;
  loginViaActiveDir = new FormControl<boolean>(true);
  public emailLoginForm = emailLoginForm
  public submission: any = {
    data: {
      password: "12345678"
    }
  }
  public activeDirectoryLoginForm = activeDirectoryLoginForm;

  options: any = {
    "disableAlerts": true
  }

  constructor(
    private auth: AuthService,
    private notif: NotificationsService,
    private router: Router,
    private ac: ActivatedRoute
  ) {
    this.ac.queryParams.pipe(takeUntil(this.destroy$)).subscribe(val => {
      if(Object.keys(val)?.length > 0) {
        this.auth.loginWithActiveDirectory(val['graphData']).pipe(takeUntil(this.destroy$))
        .subscribe((res: ApiResponse<any>) => {
          if(!res.hasErrors()) {
            this.notif.displayNotification('Successfully authenticated', 'Login', TuiNotification.Success);
            this.router.navigate(['/dashboard/home'])
          }
        })
      }
    })
    }

  onSubmit(submission: any) {
    const params: any = {
      email: submission?.data?.email,
      password: submission?.data?.password
    }
    if(params.email && params.password) {
      this.auth.login(params).pipe(first(), takeUntil(this.destroy$))
      .subscribe((res: ApiResponse<any>) => {
        if(!res.hasErrors()) {
          this.notif.displayNotification('Successfully authenticated', 'Login', TuiNotification.Success);
          this.router.navigate(['/dashboard/home'])
        }
      })
    }
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}

