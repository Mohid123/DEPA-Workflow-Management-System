import { ChangeDetectionStrategy, Component, Inject, OnDestroy } from '@angular/core';
import { DashboardService } from '../../dashboard.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import { TuiDialogContext, TuiDialogService } from '@taiga-ui/core';
import {PolymorpheusContent} from '@tinkoff/ng-polymorpheus';
import { FormControl } from '@angular/forms';

@Component({
  templateUrl: './categories-list.component.html',
  styleUrls: ['./categories-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoriesListComponent implements OnDestroy {
  categories: Observable<any>;
  categoryEditControl: FormControl = new FormControl('');
  categoryId: string;
  destroy$ = new Subject();
  limit: number = 6;
  page: number = 0;

  constructor(
    private dashboard: DashboardService,
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService
  ) {
    this.categories = this.dashboard.getAllCategories(this.limit, this.page);
  }

  changePage(page: number) {
    this.page = page;
    this.categories = this.dashboard.getAllCategories(this.limit, this.page);
  }

  editOrAddCategory() {
    if(this.categoryId) {
      this.dashboard.updateCategory({name: this.categoryEditControl?.value}, this.categoryId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        if(res) {
          this.categories = this.dashboard.getAllCategories(this.limit, this.page);
        }
      });
    }
    else {
      this.dashboard.postNewCategory({name: this.categoryEditControl?.value})
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        if(res) {
          this.categories = this.dashboard.getAllCategories(this.limit, this.page);
        }
      });
    }
  }

  deleteCategory() {
    this.dashboard.deleteCategory(this.categoryId).pipe(takeUntil(this.destroy$))
    .subscribe(() => this.categories = this.dashboard.getAllCategories(this.limit, this.page))
  }

  showDialog(content: PolymorpheusContent<TuiDialogContext>, data: any): void {
    this.dialogs.open(content, {
      dismissible: true,
      closeable: true
    }).subscribe();
    this.categoryEditControl.setValue(data?.name ? data?.name : '');
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
