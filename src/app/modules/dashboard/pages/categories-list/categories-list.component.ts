import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy } from '@angular/core';
import { DashboardService } from '../../dashboard.service';
import { BehaviorSubject, Observable, Subject, Subscription, debounceTime, shareReplay, takeUntil } from 'rxjs';
import { TuiDialogContext, TuiDialogService } from '@taiga-ui/core';
import {PolymorpheusContent} from '@tinkoff/ng-polymorpheus';
import { FormControl, Validators } from '@angular/forms';
import { AuthService } from 'src/app/modules/auth/auth.service';
import { categoryForm } from 'src/app/forms-schema/forms';
import { CodeValidator } from 'src/core/utils/utility-functions';

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
  formData = new BehaviorSubject<any>({isValid: false});
  userRoleCheckAdmin: any;
  subscription: Subscription[] = [];
  categoryControl = new FormControl('', Validators.compose([
    Validators.required
  ]), [CodeValidator.createValidator(this.dashboard, 'category')]);

  categoryControlEdit = new FormControl('', Validators.compose([
    Validators.required
  ]), [CodeValidator.createValidator(this.dashboard, 'category', undefined, undefined)])

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

  changeSize(page: number) {
    this.limit = page;
    this.categories = this.dashboard.getAllCategories(this.limit);
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
      this.categoryControlEdit.setValue(data?.name)
    }
    else {
      this.categoryId = null;
    }
  }

  editOrAddCategory() {
    if(this.categoryId) {
      if(this.categoryControlEdit.invalid) {
        this.categoryControlEdit.markAsDirty();
        return
      }
      const payload: {name: string} = {
        name: this.categoryControlEdit.value
      }
      this.dashboard.editCategory(payload, this.categoryId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        if(res) {
          this.categoryId = null;
          this.categories = this.dashboard.getAllCategories(this.limit);
          this.cf.detectChanges();
          this.subscription.forEach(val => val.unsubscribe())
          this.categoryControlEdit.reset();
          this.categoryControl.reset();
        }
      })
    }
    else {
      if(this.categoryControl.invalid) {
        this.categoryControl.markAsDirty();
        return
      }
      const payload2 = {name: this.categoryControl.value}
      this.dashboard.addCategory(payload2)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        if(res) {
          this.categories = this.dashboard.getAllCategories(this.limit);
          this.cf.detectChanges();
          this.subscription.forEach(val => val.unsubscribe())
          this.categoryControlEdit.reset();
          this.categoryControl.reset();
        }
      })
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
     this.categoryId = null
     this.cf.detectChanges();
   })
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
