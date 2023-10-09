import { CommonModule } from "@angular/common";
import {Component, Inject, OnDestroy} from "@angular/core";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { TuiButtonModule, TuiDialogContext, TuiDialogService } from "@taiga-ui/core";
import {ICellRendererAngularComp} from 'ag-grid-angular';
import {ICellRendererParams} from "ag-grid-community";
import { Subject, Subscription, takeUntil } from "rxjs";
import { CodeValidator } from "src/core/utils/utility-functions";
import { DashboardService } from "../../dashboard.service";
import {PolymorpheusContent} from '@tinkoff/ng-polymorpheus';
import { AuthService } from "src/app/modules/auth/auth.service";

@Component({
    selector: 'catgeories-actions-component',
    template: `
      <ng-container>
        <div *ngIf="cellValue?.data?.createdBy === currentUser?.id || userRoleCheckAdmin == true" class="flex justify-start gap-x-2 mt-2">
          <a (click)="showAddOrEditDialog(addTemplate, cellValue?.data)"  class="w-7 h-6 px-1 py-1 text-xs font-medium text-center text-white no-underline bg-blue-500 rounded-md cursor-pointer hover:text-white hover:bg-opacity-80 hover:transition-colors">
            <i class="fa fa-pencil-square-o fa-lg" aria-hidden="true"></i>
          </a>
          <button (click)="showDeleteDialog(cellValue?.data, deltemplate)" class="w-7 h-6 px-1 py-1 text-xs font-medium text-center text-white no-underline bg-red-500 rounded-md cursor-pointer hover:text-white hover:bg-opacity-80 hover:transition-colors">
            <i class="fa fa-trash fa-lg" aria-hidden="true"></i>
          </button>
        </div>
        <ng-template #deltemplate let-observer>
          <p class="pb-2 text-xl font-semibold text-center border-b border-gray-400">Delete Category</p>
          <p class="mt-4 text-base font-medium text-center">Are you sure you want to delete this category?</p>
          <div class="flex justify-center mt-4">
            <button
              tuiButton
              appearance="secondary-destructive"
              type="button"
              size="m"
              class="mx-3"
              (click)="deleteCategory(); observer.complete()"
              >
              Confirm
            </button>

            <button
              tuiButton
              type="button"
              size="m"
              (click)="observer.complete()"
              >
              Cancel
            </button>
          </div>
        </ng-template>

        <ng-template #addTemplate let-observer>
          <p class="text-lg font-semibold text-center">
            {{categoryId ? 'Update': 'Add'}} Category
          </p>
          <!--ADD-->
          <div *ngIf="categoryId" class="flex flex-col justify-center my-5">
            <label class="block" for="Textarea2">Category Name<sup class="text-red-500">*</sup></label>
            <input [formControl]="categoryControlEdit" class="mb-1 form-control">
            <span *ngIf="categoryControlEdit?.hasError('required') && categoryControlEdit?.dirty" class="text-xs text-red-500">
              Category is required
            </span>
            <span *ngIf="categoryControlEdit?.hasError('codeExists')" class="text-xs text-red-500">
              A category with this name already exists. Please provide a different name.
            </span>
          </div>
          <div class="flex justify-center gap-x-3">
            <button
              tuiButton
              type="button"
              size="m"
              (click)="editOrAddCategory();"
            >
              {{categoryId ? 'Update': 'Add'}}
            </button>

            <button
              tuiButton
              type="button"
              size="m"
              appearance="accent"
              (click)="observer.complete(); categoryId = null"
            >
              Cancel
            </button>
          </div>
        </ng-template>
      </ng-container>
    `,
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule, TuiButtonModule, FormsModule]
})
export class CategoryActionComponent implements ICellRendererAngularComp, OnDestroy {
  public cellValue: any;
  public currentUser: any;
  sendingDecision = new Subject<boolean>();
  destroy$ = new Subject();
  saveDialogSubscription: Subscription[] = [];
  categoryId: string = null;
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
  });
  userRoleCheckAdmin: any;
  categoryControlEdit = new FormControl('', Validators.compose([
    Validators.required
  ]), [CodeValidator.createValidator(this.dashboard, 'category', undefined, undefined)])

  constructor(
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
    private dashboard: DashboardService,
    private auth: AuthService
  ) {
    this.userRoleCheckAdmin = this.auth.checkIfRolesExist('admin');
  }

  get fE() {
    return this.userEditFormCustom.controls
  }

  checkRoles(data: any[]) {
    return data?.includes('sysAdmin')
  }

  // gets called once before the renderer is used
  agInit(params: ICellRendererParams): void {
    this.cellValue = params;
  }

  // gets called whenever the cell refreshes
  refresh(params: ICellRendererParams): boolean {
    this.cellValue = params
    return true;
  }

  showAddOrEditDialog(content: PolymorpheusContent<TuiDialogContext>, data: any) {
    this.categoryControlEdit.reset();
    this.saveDialogSubscription.push(this.dialogs.open(content, {
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

  showDeleteDialog(data: any, content: PolymorpheusContent<TuiDialogContext>): void {
    this.dialogs.open(content, {
      dismissible: false,
      closeable: false
    }).subscribe();
    this.categoryId = data?.id;
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
          this.dashboard.actionComplete.emit(true)
          this.saveDialogSubscription.forEach(val => val.unsubscribe())
          this.categoryControlEdit.reset();
        }
      })
    }
  }

  deleteCategory() {
    this.dashboard.deleteCategory(this.categoryId).pipe(takeUntil(this.destroy$))
    .subscribe(() => {
      this.categoryId = null;
      this.dashboard.actionComplete.emit(true)
    })
  }
 
  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
    this.saveDialogSubscription.forEach(val => val.unsubscribe());
  }
}