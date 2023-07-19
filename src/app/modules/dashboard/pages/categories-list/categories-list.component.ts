import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy } from '@angular/core';
import { DashboardService } from '../../dashboard.service';
import { BehaviorSubject, Observable, Subject, Subscription, takeUntil } from 'rxjs';
import { TuiDialogContext, TuiDialogService } from '@taiga-ui/core';
import {PolymorpheusContent} from '@tinkoff/ng-polymorpheus';
import { FormControl } from '@angular/forms';
import { AuthService } from 'src/app/modules/auth/auth.service';
import { categoryForm } from 'src/app/forms-schema/forms';

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
  limit: number = 10;
  page: number = 0;
  currentUser: any;
  formSubmission: any;
  categoryFormField = categoryForm;
  formData = new BehaviorSubject<any>({isValid: false});
  userRoleCheckAdmin: any;
  subscription: Subscription[] = [];

  constructor(
    private dashboard: DashboardService,
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
    private cf: ChangeDetectorRef,
    private auth: AuthService,
  ) {
    this.currentUser = this.auth.currentUserValue
    this.userRoleCheckAdmin = this.auth.checkIfRolesExist('admin')
    this.categories = this.dashboard.getAllCategories(this.limit);
  }

  changePage(page: number) {
    this.page = page;
    this.categories = this.dashboard.getAllCategories(this.limit);
  }

  showAddOrEditDialog(content: PolymorpheusContent<TuiDialogContext>, data: any) {
    this.subscription.push(this.dialogs.open(content, {
      dismissible: true,
      closeable: true
    }).subscribe());
    if(data?.id) {
      this.categoryId = data?.id;
      this.formSubmission = {
        data: {
          categoryName: data?.name
        }
      }
    }
    else {
      this.categoryId = null;
      this.formSubmission = {
        data: {}
      }
    }
  }

  editOrAddCategory() {
    const payload: {name: string} = {
      name: this.formData.value?.data?.categoryName
    }
    if(this.categoryId) {
      this.dashboard.editCategory(payload, this.categoryId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        if(res) {
          this.categoryId = null;
          this.categories = this.dashboard.getAllCategories(this.limit);
          this.cf.detectChanges();
          this.subscription.forEach(val => val.unsubscribe())
        }
      })
    }
    else {
      this.dashboard.addCategory(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        if(res) {
          this.categories = this.dashboard.getAllCategories(this.limit);
          this.cf.detectChanges();
          this.subscription.forEach(val => val.unsubscribe())
        }
      })
    }
  }

  getFormValues(value: any) {
    if(value?.data) {
      this.formData.next(value)
    }
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

  deleteCategory() {
   this.dashboard.deleteCategory(this.categoryId).pipe(takeUntil(this.destroy$))
   .subscribe(() => {
     this.categories = this.dashboard.getAllCategories(this.limit);
     this.cf.detectChanges();
   })
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
