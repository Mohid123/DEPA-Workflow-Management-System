import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TuiDialogContext, TuiDialogService } from '@taiga-ui/core';
import { Observable, Subject, Subscription, takeUntil } from 'rxjs';
import { DashboardService } from '../../dashboard.service';
import {PolymorpheusContent} from '@tinkoff/ng-polymorpheus';
import { AuthService } from 'src/app/modules/auth/auth.service';
import { CodeValidator } from 'src/core/utils/utility-functions';
import { ColDef } from 'ag-grid-community';
import { UserActionsRenderer } from './user-actions.component';

@Component({
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersListComponent implements OnDestroy {
  users: Observable<any>;
  userId: string = null;
  destroy$ = new Subject();
  limit: number = 2000;
  page: number = 0;
  formSubmission: any;
  searchValue = new FormControl();
  fetchingUsers = new Subject<boolean>();
  subscription: Subscription[] = [];
  columnDefs: ColDef[] = [
    {
      field: 'gid',
      headerName: 'GID',
      filter: true,
      floatingFilter: true,
      sortable: true,
      resizable: true
    },
    {
      field: 'fullName',
      headerName: 'Full Name',
      filter: true,
      floatingFilter: true,
      sortable: true,
      resizable: true
    },
    {
      field: 'email',
      headerName: 'Email',
      filter: true,
      floatingFilter: true,
      sortable: true,
      resizable: true
    },
    {
      field: 'roles',
      headerName: 'Role/s',
      filter: true,
      floatingFilter: true,
      sortable: true,
      resizable: true
    },
    {
      field: 'actions',
      headerName: 'Actions',
      cellRenderer: UserActionsRenderer,
      width: 80
    },
  ];
  rowData = [];

  userAddFormCustom = new FormGroup({
    fullName: new FormControl(null, Validators.compose([Validators.required])),
    email: new FormControl(null, Validators.compose([
      Validators.required,
      Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    ]), [CodeValidator.createValidator(this.dashboard, 'user')]),
    role: new FormControl(null, Validators.compose([Validators.required])),
    password: new FormControl('Welcome1!', Validators.compose([
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
    this.dashboard.getAllUsersForListing(this.limit, this.page).pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      this.rowData = res?.results;
      this.cf.detectChanges();
    });

    this.dashboard.actionComplete.pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if(res == true) {
        this.dashboard.getAllUsersForListing(this.limit, this.page)
        .pipe(takeUntil(this.destroy$))
        .subscribe((res: any) => {
          this.rowData = res?.results;
          this.cf.detectChanges();
        });
        this.dashboard.actionComplete.emit(false)
      }
    })
  }

  onGridReady(params) {
    params.api.sizeColumnsToFit();
  }

  get f() {
    return this.userAddFormCustom.controls
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

  addUser() {
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
        this.userId = null
        this.subscription.forEach(val => val.unsubscribe())
        this.dashboard.getAllUsersForListing(this.limit, this.page)
        .pipe(takeUntil(this.destroy$))
        .subscribe((res: any) => {
          this.rowData = res?.results;
          this.cf.detectChanges();
        });
      }
    })
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
