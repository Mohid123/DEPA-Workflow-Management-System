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
    selector: 'user-actions-component',
    template: `
      <ng-container>
      <div [ngClass]="checkRoles(cellValue?.data?.roles) == false ? 'block': 'hidden'" class="flex justify-start gap-x-3 mt-2">
        <a (click)="showDialog(template, cellValue?.data)" class="w-10 h-6 px-1.5 py-1 text-xs font-medium text-center text-blue-500 no-underline bg-white rounded-md cursor-pointer hover:text-blue-600">
          <i class="fa fa-pencil-square-o fa-lg" aria-hidden="true"></i>
        </a>
        <button (click)="showDeleteDialog(cellValue?.data, deltemplate)" class="w-10 h-6 px-1.5 py-1 text-xs font-medium text-center text-red-500 no-underline bg-white rounded-md cursor-pointer hover:text-red-600">
          <i class="fa fa-trash fa-lg" aria-hidden="true"></i>
        </button>
      </div>
        <!--Update User Dialog-->
        <ng-template #template let-observer>
          <p class="text-lg font-semibold text-center">
            Update User
          </p>
          <div class="flex flex-col justify-center my-5" [formGroup]="userEditFormCustom">
            <div class="mb-2">
              <label class="block">Full Name<sup class="text-red-500">*</sup></label>
              <input formControlName="fullName" class="mb-1 form-control">
              <span *ngIf="fE['fullName']?.hasError('required') && fE['fullName']?.dirty" class="text-xs text-red-500">
                Full name is required
              </span>
            </div>

            <div class="my-2">
              <label class="block">Email<sup class="text-red-500">*</sup></label>
              <input formControlName="email" class="mb-1 form-control">
              <span *ngIf="fE['email']?.hasError('required') && fE['email']?.dirty" class="text-xs text-red-500">
                Email is required
              </span>
              <span *ngIf="fE['email']?.hasError('pattern') && fE['email']?.dirty" class="text-xs text-red-500">
                Please provide a valid email address
              </span>
              <span *ngIf="fE['email']?.hasError('codeExists')" class="text-xs text-red-500">
                A user with this email already exists. Please provide a different email.
              </span>
            </div>

            <div class="my-2">
              <label class="block">Role<sup class="text-red-500">*</sup></label>
              <select class="form-select form-control" aria-label="Default select example" formControlName="role">
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
              <span *ngIf="fE['role']?.hasError('required') && fE['role']?.dirty" class="text-xs text-red-500">
                Please specify user role
              </span>
            </div>
            <div class="my-2">
              <label class="block">Password</label>
              <input type="password" formControlName="password" class="mb-1 form-control">
              <span *ngIf="fE['password']?.hasError('required') && fE['password']?.dirty" class="text-xs text-red-500">
                Password is required
              </span>
              <span *ngIf="fE['password']?.hasError('minlength') && fE['password']?.dirty" class="text-xs text-red-500">
                Password should be at least 8 characters long
              </span>
              <p *ngIf="fE['password']?.hasError('pattern') && fE['password']?.dirty" class="text-xs text-red-500">
                Password should have at least one number and one character
              </p>
            </div>
          </div>
          <div class="flex justify-center gap-x-3">
            <button
            tuiButton
            type="button"
            size="m"
            (click)="editOrAddUser();"
            >
            Update
            </button>

            <button
            tuiButton
            type="button"
            size="m"
            appearance="accent"
            (click)="observer.complete(); userId = null;"
          >
            Cancel
          </button>
          </div>
        </ng-template>
        <!-- Delete User Dialog-->
        <ng-template #deltemplate let-observer>
          <p class="pb-2 text-xl font-semibold text-center border-b border-gray-400">Delete User</p>
          <p class="mt-4 text-base font-medium text-center">Are you sure you want to delete this user ?</p>
          <div class="flex justify-center mt-4">
            <button
              tuiButton
              appearance="secondary-destructive"
              type="button"
              size="m"
              class="mx-3"
              (click)="deleteUser(); observer.complete()"
              >
              Confirm
            </button>

            <button
              tuiButton
              type="button"
              size="m"
              appearance="accent"
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
export class UserActionsRenderer implements ICellRendererAngularComp, OnDestroy {
  public cellValue: any;
  public currentUser: any;
  sendingDecision = new Subject<boolean>();
  destroy$ = new Subject();
  saveDialogSubscription: Subscription[] = [];
  userId: string = null;
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
  })

  constructor(
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
    private dashboard: DashboardService
  ) {
    // this.currentUser = this.auth.currentUserValue;
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

  showDialog(content: PolymorpheusContent<TuiDialogContext>, data: any): void {
    this.saveDialogSubscription.push(this.dialogs.open(content, {
      dismissible: false,
      closeable: false
    }).subscribe());
    this.userId = data?.id || null;
    if(data?.id) {
      this.dashboard.excludeIdEmitter.emit(data?.id)
    }
    else {
      this.dashboard.excludeIdEmitter.emit(null)
    }
    this.userEditFormCustom?.controls['fullName']?.setValue(data?.fullName)
    this.userEditFormCustom?.controls['email']?.setValue(data?.email)
    this.userEditFormCustom?.controls['role']?.setValue(data?.roles[0])
    this.userEditFormCustom?.controls['password']?.setValue(data?.password)
  }

  showDeleteDialog(data: any, content: PolymorpheusContent<TuiDialogContext>): void {
    this.dialogs.open(content, {
      dismissible: false,
      closeable: false
    }).subscribe();
    this.userId = data?.id;
  }

  editOrAddUser() {
    if(this.userId) {
      if(this.fE['email']?.invalid || this.fE['fullName']?.invalid || this.fE['role']?.invalid) {
        this.fE['email']?.markAsDirty()
        this.fE['fullName']?.markAsDirty()
        this.fE['role']?.markAsDirty()
        return
      }
      if(this.fE['password']?.value && this.fE['password']?.invalid) {
        this.fE['email']?.markAsDirty()
        this.fE['fullName']?.markAsDirty()
        this.fE['role']?.markAsDirty()
        this.fE['password']?.markAsDirty()
        return
      }
      const payload: any = {
        roles: [this.userEditFormCustom?.value?.role],
        fullName: this.userEditFormCustom?.value?.fullName,
        email: this.userEditFormCustom?.value?.email,
        password: this.userEditFormCustom?.value?.password || undefined
      }
      this.dashboard.updateUser(this.userId, payload)
      .pipe(takeUntil(this.destroy$)).subscribe(res => {
        if(res) {
          this.dashboard.actionComplete.emit(true)
          this.userId = null
          this.saveDialogSubscription.forEach(val => val.unsubscribe())
          this.userEditFormCustom.reset();
        }
      })
    }
  }

  deleteUser() {
    this.dashboard.deleteUser(this.userId).pipe(takeUntil(this.destroy$))
    .subscribe(() => {
      this.userId = null;
      this.dashboard.actionComplete.emit(true)
    })
  }
 
  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
    this.saveDialogSubscription.forEach(val => val.unsubscribe());
  }
}