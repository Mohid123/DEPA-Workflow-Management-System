import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TuiDialogContext, TuiDialogService } from '@taiga-ui/core';
import { BehaviorSubject, Observable, Subject, Subscription, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs';
import { DashboardService } from '../../dashboard.service';
import {PolymorpheusContent} from '@tinkoff/ng-polymorpheus';
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
  formSubmission: any;
  searchValue = new FormControl();
  fetchingUsers = new Subject<boolean>();
  subscription: Subscription[] = [];

  userAddFormCustom = new FormGroup({
    fullName: new FormControl(null, Validators.compose([Validators.required])),
    email: new FormControl(null, Validators.compose([
      Validators.required,
      Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    ]), [CodeValidator.createValidator(this.dashboard, 'user')]),
    role: new FormControl(null, Validators.compose([Validators.required])),
    password: new FormControl(null, Validators.compose([
      Validators.minLength(8),
      Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z]).*$')
    ]))
  })

  userEditFormCustom = new FormGroup({
    fullName: new FormControl(null, Validators.compose([Validators.required])),
    email: new FormControl(null,
    Validators.compose([
      Validators.required,
      Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    ]), [CodeValidator.createValidator(this.dashboard, 'user', undefined, undefined)]),
    role: new FormControl(null, Validators.compose([Validators.required])),
    password: new FormControl(null, Validators.compose([
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
    if(data?.id) {
      this.dashboard.excludeIdEmitter.emit(data?.id)
    }
    else {
      this.dashboard.excludeIdEmitter.emit(null)
    }
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

  editOrAddUser() {
    if(this.userId) {
      if(this.fE['email']?.invalid || this.fE['fullName']?.invalid || this.fE['role']?.invalid) {
        this.fE['email']?.markAsDirty()
        this.fE['fullName']?.markAsDirty()
        this.fE['role']?.markAsDirty()
        return
      }
      if(this.fE['password']?.value && this.fE['password']?.invalid) {
        this.fE['email']?.markAsDirty()
        this.fE['fullName']?.markAsDirty()
        this.fE['role']?.markAsDirty()
        this.fE['password']?.markAsDirty()
        return
      }
      const payload: any = {
        roles: [this.userEditFormCustom?.value?.role],
        fullName: this.userEditFormCustom?.value?.fullName,
        email: this.userEditFormCustom?.value?.email,
        password: this.userEditFormCustom?.value?.password || undefined
      }
      this.dashboard.updateUser(this.userId, payload)
      .pipe(takeUntil(this.destroy$)).subscribe(res => {
        if(res) {
          this.users = this.dashboard.getAllUsersForListing(this.limit, this.page)
          this.cf.detectChanges();
          this.userId = null
          this.subscription.forEach(val => val.unsubscribe())
          this.userEditFormCustom.reset();
          this.userAddFormCustom.reset();
        }
      })
    }
    else {
      if(this.f['email']?.invalid || this.f['fullName']?.invalid || this.f['role']?.invalid) {
        this.f['email']?.markAsDirty()
        this.f['fullName']?.markAsDirty()
        this.f['role']?.markAsDirty()
        return
      }
      if(this.f['password']?.value && this.f['password']?.invalid) {
        this.f['email']?.markAsDirty()
        this.f['fullName']?.markAsDirty()
        this.f['role']?.markAsDirty()
        this.f['password']?.markAsDirty()
        return
      }
      const payload: any = {
        roles: [this.userAddFormCustom?.value?.role],
        fullName: this.userAddFormCustom?.value?.fullName,
        email: this.userAddFormCustom?.value?.email,
        password: this.userAddFormCustom?.value?.password || undefined
      }
      this.dashboard.addNewUser(payload)
      .pipe(takeUntil(this.destroy$)).subscribe(res => {
        if(res) {
          this.users = this.dashboard.getAllUsersForListing(this.limit, this.page);
          this.cf.detectChanges();
          this.userId = null
          this.subscription.forEach(val => val.unsubscribe())
          this.userEditFormCustom.reset();
          this.userAddFormCustom.reset();
        }
      })
    }
  }

  deleteUser() {
    this.dashboard.deleteUser(this.userId).pipe(takeUntil(this.destroy$))
    .subscribe(() => {
      this.users = this.dashboard.getAllUsersForListing(this.limit, this.page);
      this.cf.detectChanges();
      this.userId = null;
    })
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
