import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../auth.service';
import { Subject, takeUntil, first, BehaviorSubject, Observable } from 'rxjs';
import { NotificationsService } from 'src/core/core-services/notifications.service';
import { Router } from '@angular/router';
import { TuiNotification } from '@taiga-ui/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  passwordHide: boolean = true;
  isLoggingIn$: Observable<boolean> = this.auth.isLoading$;
  destroy$ = new Subject();

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
      password: new FormControl(null, Validators.compose([
        Validators.required,
        Validators.maxLength(200),
        Validators.minLength(8),
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
    if(this.loginForm.value) {
      this.auth.login(this.loginForm.value).pipe(takeUntil(this.destroy$), first())
      .subscribe((response: any) => {
        if(!response.hasErrors()) {
          this.notif.displayNotification('User log in successful', 'User Login', TuiNotification.Success);
          // this.router.navigate(['/module/workflow/64015e0922c8d01d0cca6598']);
        }
    }) 
    }
  }
}

