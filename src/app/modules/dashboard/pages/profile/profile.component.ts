import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { resetPasswordForm, userAddFormProfile } from 'src/app/forms-schema/forms';
import { AuthService } from 'src/app/modules/auth/auth.service';
import { User } from 'src/core/models/user.model';
import { DashboardService } from '../../dashboard.service';
import { NotificationsService } from 'src/core/core-services/notifications.service';
import { TuiNotification } from '@taiga-ui/core';

@Component({
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent implements OnDestroy {
  currentUser: User;
  formSubmission: any;
  formData = new BehaviorSubject<any>({});
  userForm = userAddFormProfile;
  passwordForm = resetPasswordForm;
  destroy$ = new Subject();
  passValue = new BehaviorSubject<any>(null)

  constructor(private auth: AuthService, private dashboard: DashboardService, private notif: NotificationsService, private cf: ChangeDetectorRef) {
    this.currentUser = this.auth.currentUserValue;
    this.formData.next({
      fullname: this.currentUser?.fullName,
      email: this.currentUser?.email,
      roles: this.currentUser?.roles
    });

    this.formSubmission = {
      data: {
        fullname: this.currentUser?.fullName,
        email: this.currentUser?.email,
        roles: this.currentUser?.roles
      }
    }
  }

  // ngAfterViewInit(): void {
  //   const passField = document.getElementById('showPass');
  //   passField?.addEventListener('click', () => {
  //     let elem: HTMLInputElement | any = document?.getElementsByClassName('passwordField');
  //     Array.from(elem)?.forEach((val: any) => {
  //       if(val?.component?.type == 'password') {
  //         val.component.type = 'text';
  //         this.cf.detectChanges()
  //       }
  //       else {
  //         val.component.type = 'password';
  //         this.cf.detectChanges()
  //       }
  //     })
  //   })
  // }

  getFormValues(value: any) {
    if(value?.data) {
      return value
    }
  }

  getPasswordFieldValues(value: any) {
    if(value?.data) {
      this.passValue.next(value?.data);
    }
  }

  updatePassword() {
    if(this.passValue?.value?.password?.length > 0 && this.passValue?.value?.password1?.length) {
      if(this.passValue?.value?.password !== this.passValue?.value?.password1) {
        return this.notif.displayNotification('Passwords do not match', 'Update password', TuiNotification.Warning)
      }
      else {
        const payload = {
          password: this.passValue?.value?.password
        }
        this.dashboard.updateUser(this.currentUser?.id, payload)
        .pipe(takeUntil(this.destroy$)).subscribe(val => {
          if(val) {
            
          }
        })
      }
    }
    else {
      this.notif.displayNotification('Please fill in all fields', 'Update password', TuiNotification.Warning)
    }
  }

  editUser() {
    if(this.checkIfObjectValuesHaveChanged(this.formData?.value, this.formSubmission?.data) == true) {
      return this.notif.displayNotification('You have not changed any information', 'Edit User Info', TuiNotification.Warning)
    }
    else {
      const payload = {
        fullName: this.formSubmission?.data?.fullname,
        email: this.formSubmission?.data?.email,
        // roles: this.formSubmission?.data?.roles
      }
      this.dashboard.updateUser(this.currentUser?.id, payload)
      .pipe(takeUntil(this.destroy$)).subscribe((res: User | any) => {
        if(res) {
          this.auth.updateUser(res);
          this.formData.next({
            fullname: res?.fullName,
            email: res?.email,
            roles: res?.roles
          });
        }
      })
    }
  }

  checkIfObjectValuesHaveChanged(obj1: Object, obj2: Object): boolean {
    const obj1Keys = Object?.keys(obj1).sort();
    const obj2Keys = Object?.keys(obj2).sort();
    if (obj1Keys.length === obj2Keys.length) {
      const areEqual = obj1Keys.every((key, index) => {
        const objValue1 = obj1[key];
        const objValue2 = obj2[obj2Keys[index]];
        return objValue1 === objValue2;
      });
      if (areEqual) {
        return true
      } else {
        return false
      }
    }
    return false
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
