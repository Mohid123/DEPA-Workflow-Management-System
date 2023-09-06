import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TuiDialogContext, TuiDialogService } from '@taiga-ui/core';
import { BehaviorSubject, Observable, Subject, Subscription, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs';
import { DashboardService } from '../../dashboard.service';
import {PolymorpheusContent} from '@tinkoff/ng-polymorpheus';
import { userAddForm, userAddFormAdmin } from 'src/app/forms-schema/forms';
import { AuthService } from 'src/app/modules/auth/auth.service';
import { CodeValidator } from 'src/core/utils/utility-functions';

@Component({
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersListComponent implements OnDestroy {
  users: Observable<any>;
  userId: string = null;
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
  userAddFormCustom = new FormGroup({
    fullName: new FormControl('', Validators.required),
    email: new FormControl('', Validators.compose([
      Validators.required,
      Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    ]), [CodeValidator.createValidator(this.dashboard, 'user')]),
    role: new FormControl('', Validators.required),
    password: new FormControl('', Validators.compose([
      Validators.required,
      Validators.minLength(8),
      Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z]).*$')
    ]))
  })

  userEditFormCustom = new FormGroup({
    fullName: new FormControl('', Validators.required),
    email: new FormControl('', Validators.compose([
      Validators.required,
      Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    ]), [CodeValidator.createValidator(this.dashboard, 'user', undefined, undefined)]),
    role: new FormControl('', Validators.required),
    password: new FormControl('', Validators.compose([
      Validators.required,
      Validators.minLength(8),
      Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z]).*$')
    ]))
  })

  constructor(
    private dashboard: DashboardService,
    private auth: AuthService,
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

    get f() {
      return this.userAddFormCustom.controls
    }

    get fE() {
      return this.userEditFormCustom.controls
    }

  changePage(page: number) {
    this.page = page;
    this.users = this.dashboard.getAllUsersForListing(this.limit, this.page);
  }

  changeSize(page: number) {
    this.limit = page;
    this.users = this.dashboard.getAllUsersForListing(this.limit, this.page);
  }

  checkRoles(data: any[]) {
    return data?.includes('sysAdmin')
  }

  showDialog(content: PolymorpheusContent<TuiDialogContext>, data: any): void {
    this.subscription.push(this.dialogs.open(content, {
      dismissible: false,
      closeable: false
    }).subscribe());
    this.userId = data?.id || null;
    this.dashboard.excludeIdEmitter.emit(data?.id)
    this.userEditFormCustom?.controls['fullName']?.setValue(data?.fullName)
    this.userEditFormCustom?.controls['email']?.setValue(data?.email)
    this.userEditFormCustom?.controls['role']?.setValue(data?.roles[0])
    this.userEditFormCustom?.controls['password']?.setValue(data?.password)
  }

  showAddDialog(content: PolymorpheusContent<TuiDialogContext>): void {
    this.subscription.push(this.dialogs.open(content, {
      dismissible: false,
      closeable: false
    }).subscribe());
    this.formSubmission = {
      data: {}
    }
  }

  showDeleteDialog(data: any, content: PolymorpheusContent<TuiDialogContext>): void {
    this.dialogs.open(content, {
      dismissible: false,
      closeable: false
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
        roles: [this.formData?.value?.data?.role],
        fullName: this.formData?.value?.data?.fullname,
        email: this.formData?.value?.data?.email,
        password: this.formData?.value?.data?.password
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
        roles: [this.userAddFormCustom?.value?.role],
        fullName: this.userAddFormCustom?.value?.fullName,
        email: this.userAddFormCustom?.value?.email,
        password: this.userAddFormCustom?.value?.password
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
