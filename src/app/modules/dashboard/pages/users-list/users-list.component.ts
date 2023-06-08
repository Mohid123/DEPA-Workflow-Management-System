import { Component, EventEmitter, Inject, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TuiDialogContext, TuiDialogService } from '@taiga-ui/core';
import { BehaviorSubject, Observable, Subject, debounceTime, distinctUntilChanged, filter, map, switchMap, takeUntil } from 'rxjs';
import { DashboardService } from '../../dashboard.service';
import {PolymorpheusContent} from '@tinkoff/ng-polymorpheus';
import { userAddForm } from 'src/app/forms-schema/forms';

@Component({
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss']
})
export class UsersListComponent implements OnDestroy {
  users: Observable<any>;
  userId: string;
  destroy$ = new Subject();
  limit: number = 6;
  page: number = 0;
  userForm = userAddForm;
  formData = new BehaviorSubject<any>({isValid: false});
  formSubmission: any;
  searchValue = new FormControl();

  constructor(
    private dashboard: DashboardService,
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService) {
      this.users = this.dashboard.getAllUsersForListing(this.limit, this.page);

      this.searchValue.valueChanges.pipe(
        distinctUntilChanged(),
        debounceTime(400),
        switchMap(searchStr => searchStr == '' ?
        this.users = this.dashboard.getAllUsersForListing(this.limit, this.page) :
        this.users = this.dashboard.getAllUsersForListing(this.limit, this.page, searchStr)),
        takeUntil(this.destroy$)
      ).subscribe()
    }
  
  changePage(page: number) {
    this.page = page;
    this.users = this.dashboard.getAllUsersForListing(this.limit, this.page);
  }

  showDialog(content: PolymorpheusContent<TuiDialogContext>, data: any): void {
    this.dialogs.open(content, {
      dismissible: true,
      closeable: true
    }).subscribe();
    this.userId = data?.id || null;
    this.formSubmission = {
      data: {
        fullname: data?.fullName,
        email: data?.email,
        role: data?.role
      }
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
        fullName: this.formData?.value?.data?.fullname,
        email: this.formData?.value?.data?.email,
        role: this.formData?.value?.data?.role
      }
      this.dashboard.updateUser(this.userId, payload)
      .pipe(takeUntil(this.destroy$)).subscribe(res => {
        this.users = this.dashboard.getAllUsersForListing(this.limit, this.page)
      })
    }
    else {
      const payload: any = {
        fullName: this.formData?.value?.data?.fullname,
        email: this.formData?.value?.data?.email,
        role: this.formData?.value?.data?.role
      }
      this.dashboard.addNewUser(payload)
      .pipe(takeUntil(this.destroy$)).subscribe(res => {
        this.users = this.dashboard.getAllUsersForListing(this.limit, this.page)
      })
    }
  }

  deleteUser() {
    this.dashboard.deleteUser(this.userId).pipe(takeUntil(this.destroy$))
    .subscribe(() => this.users = this.dashboard.getAllUsersForListing(this.limit, this.page))
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
