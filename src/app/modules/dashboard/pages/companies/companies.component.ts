import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Observable, Subject, Subscription, takeUntil } from 'rxjs';
import { DashboardService } from '../../dashboard.service';
import { TuiDialogContext, TuiDialogService } from '@taiga-ui/core';
import {PolymorpheusContent} from '@tinkoff/ng-polymorpheus';

@Component({
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.scss']
})
export class CompaniesComponent {
  companies: Observable<any>;
  categoryEditControl: FormControl = new FormControl('', Validators.required);
  groupCodeControl: FormControl = new FormControl('', Validators.compose([
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(7),
  ]));
  categoryId: string;
  destroy$ = new Subject();
  limit: number = 6;
  page: number = 0;
  subscription: Subscription[] = [];

  constructor(
    private dashboard: DashboardService,
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService
  ) {
    this.companies = this.dashboard.getAllCompanies(this.limit, this.page);
  }

  changePage(page: number) {
    this.page = page;
    this.companies = this.dashboard.getAllCompanies(this.limit, this.page);
  }

  editOrAddCompany() {
    if(this.categoryId) {
      this.dashboard.updateCompany({
        title: this.categoryEditControl?.value,
        groupCode: this.groupCodeControl?.value
      }, this.categoryId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        if(res) {
          this.companies = this.dashboard.getAllCompanies(this.limit, this.page);
          this.subscription.forEach(val => val.unsubscribe())
        }
      });
    }
    else {
      this.dashboard.addCompany({
        title: this.categoryEditControl?.value,
        groupCode: this.groupCodeControl?.value
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        if(res) {
          this.companies = this.dashboard.getAllCompanies(this.limit, this.page);
          this.subscription.forEach(val => val.unsubscribe())
        }
      });
    }
  }

  deleteCompanyData() {
    this.dashboard.deleteCompany(this.categoryId).pipe(takeUntil(this.destroy$))
    .subscribe(() => this.companies = this.dashboard.getAllCompanies(this.limit, this.page))
  }

  showDialog(content: PolymorpheusContent<TuiDialogContext>, data: any): void {
    this.subscription.push(this.dialogs.open(content, {
      dismissible: true,
      closeable: true
    }).subscribe());
    this.categoryEditControl.setValue(data?.title ? data?.title : '');
    this.categoryId = data?.id || null;
  }

  showDeleteDialog(data: any, content: PolymorpheusContent<TuiDialogContext>): void {
    this.dialogs.open(content, {
      dismissible: true,
      closeable: true
    }).subscribe();
    this.categoryId = data?.id;
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
