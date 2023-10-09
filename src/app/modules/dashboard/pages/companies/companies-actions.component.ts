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

@Component({
    selector: 'companies-actions-component',
    template: `
      <ng-container>
        <div class="flex justify-start gap-x-2 mt-2">
          <a (click)="showAddOrEditDialog(editTemplate, cellValue?.data)"  class="w-7 h-6 px-1 py-1 text-xs font-medium text-center text-white no-underline bg-blue-500 rounded-md cursor-pointer hover:text-white hover:bg-opacity-80 hover:transition-colors">
            <i class="fa fa-pencil-square-o fa-lg" aria-hidden="true"></i>
          </a>
          <button (click)="showDeleteDialog(cellValue?.data, deltemplate)" class="w-7 h-6 px-1 py-1 text-xs font-medium text-center text-white no-underline bg-red-500 rounded-md cursor-pointer hover:text-white hover:bg-opacity-80 hover:transition-colors">
            <i class="fa fa-trash fa-lg" aria-hidden="true"></i>
          </button>
        </div>

        <ng-template #editTemplate let-observer>
        <p class="text-lg font-semibold text-center">
          Update Company
        </p>
        <div class="flex flex-col justify-center my-5">
          <label class="block" for="Textarea1">Company Name <sup class="text-red-500">*</sup></label>
          <input [formControl]="categoryEditControlEdit" class="mb-1 form-control">
          <span *ngIf="categoryEditControlEdit?.hasError('required') && categoryEditControlEdit?.dirty" class="text-xs text-red-500">
            Company name is required
          </span>
          <span class="text-xs text-red-500"
            *ngIf="categoryEditControlEdit?.hasError('codeExists')">
            A company with this name already exists. Please provide another name.
          </span>
        </div>
        <div class="flex flex-col justify-center my-5">
          <label class="block" for="Textarea2">Group Code<sup class="text-red-500">*</sup></label>
          <input [formControl]="groupCodeControlEdit" class="mb-1 form-control">
          <span *ngIf="groupCodeControlEdit?.hasError('required') && groupCodeControlEdit?.dirty" class="text-xs text-red-500">
            Group Code is required
          </span>
          <span *ngIf="groupCodeControlEdit?.hasError('minlength') && groupCodeControlEdit?.dirty" class="text-xs text-red-500">
            Group Code should be at least 3 characters
          </span>
          <span *ngIf="groupCodeControlEdit?.hasError('maxlength') && groupCodeControlEdit?.dirty" class="text-xs text-red-500">
            Group Code should not exceed 4 characters
          </span>
          <span *ngIf="groupCodeControlEdit?.hasError('codeExists')" class="text-xs text-red-500">
            A company with this code already exists. Please provide a different code.
          </span>
        </div>
        <div class="flex justify-center gap-x-3">
          <button
          tuiButton
          type="button"
          size="m"
          (click)="editOrAddCompany();"
          >
          Update
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

      <ng-template #deltemplate let-observer>
        <p class="pb-2 text-xl font-semibold text-center border-b border-gray-400">Delete Company</p>
        <p class="mt-4 text-base font-medium text-center">Are you sure you want to delete this company?</p>
        <div class="flex justify-center mt-4">
          <button
            tuiButton
            appearance="secondary-destructive"
            type="button"
            size="m"
            class="mx-3"
            (click)="deleteCompanyData(); observer.complete()"
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
      </ng-container>
    `,
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule, TuiButtonModule, FormsModule]
})
export class CompanyActionComponent implements ICellRendererAngularComp, OnDestroy {
  public cellValue: any;
  public currentUser: any;
  sendingDecision = new Subject<boolean>();
  destroy$ = new Subject();
  saveDialogSubscription: Subscription[] = [];
  categoryId: string = null;
  categoryEditControlEdit: FormControl = new FormControl('', Validators.compose([
    Validators.required
  ]), [CodeValidator.createValidator(this.dashboard, 'company', 'title')]);

  groupCodeControlEdit: FormControl = new FormControl('', Validators.compose([
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(4),
  ]), [CodeValidator.createValidator(this.dashboard, 'company')]);
 

  constructor(
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
    private dashboard: DashboardService
  ) {
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
    this.saveDialogSubscription.push(this.dialogs.open(content, {
      dismissible: false,
      closeable: false
    }).subscribe());
    if(data?.id) {
      this.dashboard.excludeIdEmitter.emit(data?.id)
    }
    else {
      this.dashboard.excludeIdEmitter.emit(null)
    }
    this.categoryEditControlEdit.setValue(data?.title ? data?.title : '');
    this.groupCodeControlEdit.setValue(data?.groupCode ? data?.groupCode : '');
    this.categoryId = data?.id || null;
  }

  showDeleteDialog(data: any, content: PolymorpheusContent<TuiDialogContext>): void {
    this.dialogs.open(content, {
      dismissible: false,
      closeable: false
    }).subscribe();
    this.categoryId = data?.id;
  }

  editOrAddCompany() {
    if(this.categoryId) {
      if(this.categoryEditControlEdit.invalid || this.groupCodeControlEdit.invalid) {
        this.categoryEditControlEdit.markAsDirty();
        this.groupCodeControlEdit.markAsDirty();
        return;
      }
      this.dashboard.updateCompany({
        title: this.categoryEditControlEdit?.value,
        groupCode: this.groupCodeControlEdit?.value
      }, this.categoryId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        if(res) {
          this.saveDialogSubscription.forEach(val => val.unsubscribe())
          this.categoryEditControlEdit.reset()
          this.groupCodeControlEdit.reset()
          this.categoryId = null;
          this.dashboard.actionComplete.emit(true)
        }
      });
    }
  }

  deleteCompanyData() {
    this.dashboard.deleteCompany(this.categoryId).pipe(takeUntil(this.destroy$))
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