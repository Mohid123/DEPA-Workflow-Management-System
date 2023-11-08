import { Component, OnDestroy } from '@angular/core';
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
  /**
   * Observable for showing loader on pending login state
   */
  isLoggingIn$: Observable<boolean> = this.auth.isLoading$;

  /**
   * Subject used to unsubsribe from active observabel streams
   */
  destroy$ = new Subject();

  // loginViaActiveDir = new FormControl<boolean>(true);

  /**
   * Form IO email login form
   */
  public emailLoginForm = emailLoginForm

  /**
   * The default submission object for the form
   */
  public submission: any = {
    data: {
      password: "12345678"
    }
  }
  public activeDirectoryLoginForm = activeDirectoryLoginForm;

  /**
   * Default options for Form IO form/s
   */
  options: any = {
    "disableAlerts": true
  }

  constructor(
    private auth: AuthService,
    private notif: NotificationsService,
    private router: Router,
    private ac: ActivatedRoute
  ) {
    this.checkIfADL();
  }

  /**
   * Method to check if active directory login method is active i.e. graphData query param is attached to url
   */
  checkIfADL() {
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

  /**
   * Method to login to app store (not via active directory)
   * @param submission Submission object of email login form
   */
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

   /**
   * Built in Angular Lifecycle method that is run when component or page is destroyed or removed from DOM
   */
  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}

