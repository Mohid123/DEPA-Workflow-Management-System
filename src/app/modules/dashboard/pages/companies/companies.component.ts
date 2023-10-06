import { Component, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Observable, Subject, Subscription, takeUntil } from 'rxjs';
import { DashboardService } from '../../dashboard.service';
import { TuiDialogContext, TuiDialogService } from '@taiga-ui/core';
import {PolymorpheusContent} from '@tinkoff/ng-polymorpheus';
import { CodeValidator } from 'src/core/utils/utility-functions';
import { ColDef } from 'ag-grid-community';
import { CompanyActionComponent } from './companies-actions.component';

@Component({
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.scss']
})
export class CompaniesComponent {
  companies: Observable<any>;

  categoryEditControl: FormControl = new FormControl('', Validators.compose([
    Validators.required
  ]), [CodeValidator.createValidator(this.dashboard, 'company', 'title')]);

  groupCodeControl: FormControl = new FormControl('', Validators.compose([
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(4),
  ]), [CodeValidator.createValidator(this.dashboard, 'company')]);

  categoryId: string;
  destroy$ = new Subject();
  limit: number = 2000;
  page: number = 0;
  subscription: Subscription[] = [];
  columnDefs: ColDef[] = [
    {
      field: 'groupCode',
      headerName: 'Group Code',
      filter: true,
      floatingFilter: true,
      sortable: true,
      resizable: true
    },
    {
      field: 'title',
      headerName: 'Company Name',
      filter: true,
      floatingFilter: true,
      sortable: true,
      resizable: true
    },
    {
      field: 'actions',
      headerName: 'Actions',
      cellRenderer: CompanyActionComponent,
      width: 60
    },
  ];
  rowData = [];

  constructor(
    private dashboard: DashboardService,
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService
  ) {
    this.dashboard.getAllCompanies(this.limit, this.page)
    .pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      this.rowData = res.results;
    });

    this.dashboard.actionComplete
    .pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if(res == true) {
        this.dashboard.getAllCompanies(this.limit, this.page)
        .pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
          this.rowData = res.results;
        });
      }
    })
  }

  onGridReady(params) {
    params.api.sizeColumnsToFit();
  }

  editOrAddCompany() {
    if(this.categoryEditControl.invalid || this.groupCodeControl.invalid) {
      this.categoryEditControl.markAsDirty();
      this.groupCodeControl.markAsDirty();
      return;
    }
    this.dashboard.addCompany({
      title: this.categoryEditControl?.value,
      groupCode: this.groupCodeControl?.value
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe(res => {
      if(res) {
        this.dashboard.getAllCompanies(this.limit, this.page)
        .pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
          this.rowData = res.results;
        });
        this.subscription.forEach(val => val.unsubscribe());
        this.categoryEditControl.reset()
        this.groupCodeControl.reset()
        this.categoryId = null
      }
    });
  }

  showDialog(content: PolymorpheusContent<TuiDialogContext>, data: any): void {
    this.subscription.push(this.dialogs.open(content, {
      dismissible: false,
      closeable: false
    }).subscribe());
    if(data?.id) {
      this.dashboard.excludeIdEmitter.emit(data?.id);
    }
    else {
      this.dashboard.excludeIdEmitter.emit(null);
    }
  }

  showDeleteDialog(data: any, content: PolymorpheusContent<TuiDialogContext>): void {
    this.dialogs.open(content, {
      dismissible: false,
      closeable: false
    }).subscribe();
    this.categoryId = data?.id;
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
