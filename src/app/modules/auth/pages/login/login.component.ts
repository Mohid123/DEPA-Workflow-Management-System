import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../auth.service';
import { Subject, takeUntil, first, BehaviorSubject, Observable } from 'rxjs';
import { NotificationsService } from 'src/core/core-services/notifications.service';
import { Router } from '@angular/router';
import { TuiNotification } from '@taiga-ui/core';
import { ApiResponse } from 'src/core/models/api-response.model';

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  passwordHide: boolean = true;
  isLoggingIn$: Observable<boolean> = this.auth.isLoading$;
  destroy$ = new Subject();
  loginViaActiveDir = new FormControl<boolean>(true);

  constructor(private auth: AuthService, private notif: NotificationsService, private router: Router) {}

  ngOnInit(): void {
    this.initLoginForm();
  }

  initLoginForm() {
    this.loginForm = new FormGroup({
      email: new FormControl(null, Validators.compose([
        Validators.required,
        Validators.email
      ])),
      username: new FormControl(null, Validators.compose([
        Validators.required
      ])),
      password: new FormControl(null, Validators.compose([
        Validators.required,
        Validators.maxLength(200),
        Validators.minLength(6),
        // Validators.pattern('^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$')
      ]))
    })
  }

  get f() {
    return this.loginForm.controls;
  }

  passwordShowHide(): void {
    this.passwordHide = !this.passwordHide;
  }

  submitForm() {
    if(this.loginViaActiveDir?.value === true) {
      const params: any = {
        username: this.f['username']?.value,
        password: this.f['password']?.value
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
      else {
        this.loginForm.markAllAsTouched();
      }
    }
    else {
      const params: any = {
        email: this.f['email']?.value,
        password: this.f['password']?.value
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
      else {
        this.loginForm.markAllAsTouched();
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}

