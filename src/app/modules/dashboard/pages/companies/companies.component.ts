import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Observable, Subject, Subscription, takeUntil } from 'rxjs';
import { DashboardService } from '../../dashboard.service';
import { TuiDialogContext, TuiDialogService } from '@taiga-ui/core';
import {PolymorpheusContent} from '@tinkoff/ng-polymorpheus';
import { CodeValidator } from 'src/core/utils/utility-functions';

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

  //Edit controls

  categoryEditControlEdit: FormControl = new FormControl('', Validators.compose([
    Validators.required
  ]));
  groupCodeControlEdit: FormControl = new FormControl('', Validators.compose([
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(4),
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

  changeSize(page: number) {
    this.limit = page;
    this.companies = this.dashboard.getAllCompanies(this.limit, this.page);
  }

  editOrAddCompany() {
    if(this.categoryId) {
      this.dashboard.updateCompany({
        title: this.categoryEditControlEdit?.value,
        groupCode: this.groupCodeControlEdit?.value
      }, this.categoryId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        if(res) {
          this.companies = this.dashboard.getAllCompanies(this.limit, this.page);
          this.subscription.forEach(val => val.unsubscribe())
          this.categoryEditControl.reset()
          this.groupCodeControl.reset()
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
          this.subscription.forEach(val => val.unsubscribe());
          this.categoryEditControl.reset()
          this.groupCodeControl.reset()
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
    this.categoryEditControlEdit.setValue(data?.title ? data?.title : '');
    this.groupCodeControlEdit.setValue(data?.groupCode ? data?.groupCode : '');
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
