import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy } from '@angular/core';
import { DashboardService } from '../../dashboard.service';
import { BehaviorSubject, Observable, Subject, Subscription, takeUntil } from 'rxjs';
import { TuiDialogContext, TuiDialogService } from '@taiga-ui/core';
import {PolymorpheusContent} from '@tinkoff/ng-polymorpheus';
import { FormControl, Validators } from '@angular/forms';
import { AuthService } from 'src/app/modules/auth/auth.service';
import { CodeValidator } from 'src/core/utils/utility-functions';
import { ColDef } from 'ag-grid-community';
import { CategoryActionComponent } from './categories-actions.component';

@Component({
  templateUrl: './categories-list.component.html',
  styleUrls: ['./categories-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoriesListComponent implements OnDestroy {
  categories: Observable<any>;
  categoryEditControl: FormControl = new FormControl('');
  categoryId: string = null;
  destroy$ = new Subject();
  limit: number = 2000;
  page: number = 0;
  currentUser: any;
  formData = new BehaviorSubject<any>({isValid: false});
  userRoleCheckAdmin: any;
  subscription: Subscription[] = [];
  columnDefs: ColDef[] = [
    {
      field: 'name',
      headerName: 'Category Name',
      filter: true,
      floatingFilter: true,
      sortable: true,
      resizable: true
    },
    {
      field: 'actions',
      headerName: 'Actions',
      cellRenderer: CategoryActionComponent,
      width: 30
    },
  ];
  rowData = [];

  categoryControl = new FormControl('', Validators.compose([
    Validators.required
  ]), [CodeValidator.createValidator(this.dashboard, 'category')]);

  constructor(
    private dashboard: DashboardService,
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
    private cf: ChangeDetectorRef,
    private auth: AuthService,
  ) {
    this.currentUser = this.auth.currentUserValue
    this.userRoleCheckAdmin = this.auth.checkIfRolesExist('admin')
    this.dashboard.getAllCategories(this.limit)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      this.rowData = res.results;
      this.cf.detectChanges();
    });

    this.dashboard.actionComplete
    .pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if(res == true) {
        this.dashboard.getAllCategories(this.limit)
        .pipe(takeUntil(this.destroy$))
        .subscribe((res: any) => {
          this.rowData = res.results;
          this.cf.detectChanges();
        });
      }
    })
  }

  onGridReady(params) {
    params.api.sizeColumnsToFit();
  }

  showAddOrEditDialog(content: PolymorpheusContent<TuiDialogContext>, data: any) {
    this.categoryControl.reset();
    this.subscription.push(this.dialogs.open(content, {
      dismissible: false,
      closeable: false
    }).subscribe());
    if(data?.id) {
      this.categoryId = data?.id;
      this.dashboard.excludeIdEmitter.emit(data?.id)
    }
    else {
      this.categoryId = null;
    }
  }

  editOrAddCategory() {
    if(this.categoryControl.invalid) {
      this.categoryControl.markAsDirty();
      return
    }
    const payload2 = {name: this.categoryControl.value}
    this.dashboard.addCategory(payload2)
    .pipe(takeUntil(this.destroy$))
    .subscribe(res => {
      if(res) {
        this.dashboard.getAllCategories(this.limit)
        .pipe(takeUntil(this.destroy$))
        .subscribe((res: any) => {
          this.rowData = res.results;
          this.cf.detectChanges();
        });
        this.cf.detectChanges();
        this.subscription.forEach(val => val.unsubscribe())
        this.categoryControl.reset();
      }
    })
  }

  showStatus(value: number) {
    if(value == 1) {
      return 'Published'
    }
    if(value == 2) {
      return 'Deleted'
    }
    return 'Draft'
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
