import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TuiDialogContext, TuiDialogService } from '@taiga-ui/core';
import { BehaviorSubject, Observable, Subject, Subscription, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs';
import { DashboardService } from '../../dashboard.service';
import {PolymorpheusContent} from '@tinkoff/ng-polymorpheus';
import { userAddForm, userAddFormAdmin } from 'src/app/forms-schema/forms';

@Component({
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersListComponent implements OnDestroy {
  users: Observable<any>;
  userId: string;
  destroy$ = new Subject();
  limit: number = 6;
  page: number = 0;
  userForm = userAddForm;
  addUserForm = userAddFormAdmin;
  formData = new BehaviorSubject<any>({isValid: false});
  formSubmission: any;
  searchValue = new FormControl();
  fetchingUsers = new Subject<boolean>();
  subscription: Subscription[] = [];

  constructor(
    private dashboard: DashboardService,
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
    private cf: ChangeDetectorRef
  ) {
      this.users = this.dashboard.getAllUsersForListing(this.limit, this.page);

      this.searchValue.valueChanges.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap(searchStr => searchStr == '' ?
        this.users = this.dashboard.getAllUsersForListing(this.limit, this.page) :
        this.users = this.dashboard.getAllUsersForListing(this.limit, this.page, searchStr)),
        takeUntil(this.destroy$)
      ).subscribe(() => {
        this.cf.detectChanges()
      })
    }

  changePage(page: number) {
    this.page = page;
    this.users = this.dashboard.getAllUsersForListing(this.limit, this.page);
  }

  showDialog(content: PolymorpheusContent<TuiDialogContext>, data: any): void {
    this.subscription.push(this.dialogs.open(content, {
      dismissible: true,
      closeable: true
    }).subscribe());
    this.userId = data?.id || null;
    this.formSubmission = {
      data: {
        fullname: data?.fullName,
        email: data?.email,
        role: data?.roles
      }
    }
  }

  showAddDialog(content: PolymorpheusContent<TuiDialogContext>): void {
    this.subscription.push(this.dialogs.open(content, {
      dismissible: true,
      closeable: true
    }).subscribe());
    this.formSubmission = {
      data: {}
    }
  }

  showDeleteDialog(data: any, content: PolymorpheusContent<TuiDialogContext>): void {
    this.dialogs.open(content, {
      dismissible: true,
      closeable: true
    }).subscribe();
    this.userId = data?.id;
  }

  getFormValues(value: any) {
    if(value?.data) {
      this.formData.next(value)
    }
  }

  editOrAddUser() {
    if(this.userId) {
      const payload: any = {
        roles: this.formData?.value?.data?.role,
        fullName: this.formData?.value?.data?.fullname,
        email: this.formData?.value?.data?.email,
      }
      this.dashboard.updateUser(this.userId, payload)
      .pipe(takeUntil(this.destroy$)).subscribe(res => {
        if(res) {
          this.users = this.dashboard.getAllUsersForListing(this.limit, this.page)
          this.cf.detectChanges();
          this.subscription.forEach(val => val.unsubscribe())
        }
      })
    }
    else {
      const payload: any = {
        fullName: this.formData?.value?.data?.fullname,
        email: this.formData?.value?.data?.email,
        roles: this.formData?.value?.data?.role
      }
      this.dashboard.addNewUser(payload)
      .pipe(takeUntil(this.destroy$)).subscribe(res => {
        if(res) {
          this.users = this.dashboard.getAllUsersForListing(this.limit, this.page);
          this.cf.detectChanges();
          this.subscription.forEach(val => val.unsubscribe())
        }
      })
    }
  }

  deleteUser() {
    this.dashboard.deleteUser(this.userId).pipe(takeUntil(this.destroy$))
    .subscribe(() => {
      this.users = this.dashboard.getAllUsersForListing(this.limit, this.page);
      this.cf.detectChanges()
    })
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
