import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { userAddForm } from 'src/app/forms-schema/forms';
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
  userForm = userAddForm;
  destroy$ = new Subject();

  constructor(private auth: AuthService, private dashboard: DashboardService, private notif: NotificationsService) {
    this.currentUser = this.auth.currentUserValue;
    this.formData.next({
      fullname: this.currentUser?.fullName,
      email: this.currentUser?.email,
      role: this.currentUser?.role
    });

    this.formSubmission = {
      data: {
        fullname: this.currentUser?.fullName,
        email: this.currentUser?.email,
        role: this.currentUser?.role
      }
    }
  }

  getFormValues(value: any) {
    if(value?.data) {
      return value
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
        role: this.formSubmission?.data?.role
      }
      this.dashboard.updateUser(this.currentUser?.id, payload)
      .pipe(takeUntil(this.destroy$)).subscribe((res: User | any) => {
        if(res) {
          this.auth.updateUser(res);
          this.formData.next({
            fullname: res?.fullName,
            email: res?.email,
            role: res?.role
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
