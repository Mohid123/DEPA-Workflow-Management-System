import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy } from '@angular/core';
import { DashboardService } from '../../dashboard.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import { TuiDialogContext, TuiDialogService } from '@taiga-ui/core';
import {PolymorpheusContent} from '@tinkoff/ng-polymorpheus';
import { FormControl } from '@angular/forms';
import { AuthService } from 'src/app/modules/auth/auth.service';
import { Router } from '@angular/router';

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
  currentUser: any;

  constructor(
    private dashboard: DashboardService,
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
    private cf: ChangeDetectorRef,
    private auth: AuthService,
    private router: Router
  ) {
    this.currentUser = this.auth.currentUserValue
    this.categories = this.dashboard.getAllModules();
  }

  changePage(page: number) {
    this.page = page;
    this.categories = this.dashboard.getAllModules();
  }

  editCategory(id: string) {
    this.dashboard.getModuleByIDForEditModule(id).pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if(res) {
        this.router.navigate(['/dashboard/create-edit-category'])
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

  deleteCategory() {
    this.dashboard.deleteModule(this.categoryId).pipe(takeUntil(this.destroy$))
    .subscribe(() => {
      this.categories = this.dashboard.getAllModules();
      this.cf.detectChanges()
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
