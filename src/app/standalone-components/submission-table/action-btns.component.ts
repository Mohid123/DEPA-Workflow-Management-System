import { CommonModule } from "@angular/common";
import {Component, Inject, OnDestroy} from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { TuiButtonModule, TuiDialogContext, TuiDialogService } from "@taiga-ui/core";
import {ICellRendererAngularComp} from 'ag-grid-angular';
import {ICellRendererParams} from "ag-grid-community";
import { Subject, Subscription, takeUntil } from "rxjs";
import { AuthService } from "src/app/modules/auth/auth.service";
import { StorageItem, getItem, getItemSession, setItem, setItemSession } from "src/core/utils/local-storage.utils";
import {PolymorpheusContent} from '@tinkoff/ng-polymorpheus';
import { WorkflowsService } from "src/app/modules/workflows/workflows.service";

@Component({
    selector: 'action-button-component',
    template: `
      <ng-container *ngIf="cellValue?.data?.submissionStatus !== 'Draft' && cellValue?.data?.status !== 2">
        <div class="w-full">
          <a
            title="Edit Submission & Perform Workflow Action"
            (click)="editWorkflowRoute(cellValue?.data?.id, cellValue?.data?.code)"
            *ngIf="checkEditDisableDeleteButton(cellValue?.data) == true && (cellValue?.data?.submissionStatus == 'In Progress' || cellValue?.data?.submissionStatus == 'Created')"
            class="w-10 px-[8px] pt-1 pb-1.5 mr-1.5 text-xs font-medium text-center text-white no-underline bg-blue-500 rounded-md cursor-pointer hover:text-white hover:bg-opacity-80 hover:transition-colors">
            <i class="fa fa-pencil" aria-hidden="true"></i>
          </a>
          <!--VIEW-->
          <a
            title="View Submission"
            (click)="viewWorkflowRoute(cellValue?.data?.id, cellValue?.data?.code)"
            *ngIf="checkViewButtonCondition(cellValue?.data) == true"
            class="w-10 px-1.5 pt-1 pb-1.5 text-center text-xs font-medium text-white no-underline bg-green-600 rounded-md cursor-pointer hover:text-white hover:bg-opacity-80 hover:transition-colors">
            <i class="fa fa-eye fa-lg" aria-hidden="true"></i>
          </a>
          <!--Delete-->
          <a
            title="Delete Submission"
            (click)="showDeleteDialog(dialog, 'delete', cellValue?.data?.id, cellValue?.data?.workflowStatus)"
            *ngIf="checkEditDisableDeleteButton(cellValue?.data) == true && (cellValue?.data?.submissionStatus == 'In Progress' || cellValue?.data?.submissionStatus == 'Created' || cellValue?.data?.submissionStatus == 'Completed')"
            class="w-10 px-2 pt-1 pb-1.5 text-center ml-1.5 text-xs font-medium text-white no-underline bg-red-600 rounded-md cursor-pointer hover:text-white hover:bg-opacity-80 hover:transition-colors">
            <i class="fa fa-trash fa-lg" aria-hidden="true"></i>
          </a>
          <!--Cancel-->
          <a
            title="Cancel Submission"
            (click)="showDeleteDialog(dialog, 'cancel', cellValue?.data?.id, cellValue?.data?.workflowStatus)"
            *ngIf="checkEditDisableDeleteButton(cellValue?.data) == true && (cellValue?.data?.submissionStatus == 'In Progress' || cellValue?.data?.submissionStatus == 'Created' || cellValue?.data?.submissionStatus == 'Completed')"
            class="w-10 px-1.5 pt-1 pb-1.5 text-center ml-1.5 text-xs font-medium text-white no-underline bg-[#CF5C27] rounded-md cursor-pointer hover:text-white hover:bg-opacity-80 hover:transition-colors">
            <i class="fa fa-ban fa-lg" aria-hidden="true"></i>
          </a>
        </div>
      </ng-container>
      <!--EDIT SUBMISSION PAGE-->
      <a
        *ngIf="cellValue?.data?.submissionStatus == 'Draft' && checkEditDisableDeleteButton(cellValue?.data) == true"
        title="Update Submission Status"
        [routerLink]="['/modules/edit-submission', cellValue?.data?.id]"
        (click)="setWorkflowID(cellValue?.data?.code, cellValue?.data?.id)"
        class="w-10 px-1.5 pt-1 pb-1.5 text-center mr-1.5 text-xs font-medium text-white no-underline bg-blue-500 rounded-md cursor-pointer hover:text-white hover:bg-opacity-80 hover:transition-colors">
        <i class="fa fa-edit fa-lg" aria-hidden="true"></i>
      </a>

      <ng-template #dialog let-observer>
        <p class="mb-5 text-lg font-semibold text-center">
          {{dialogTitle}} Submission
        </p>
        <p class="text-base font-semibold text-center">
          You are about to <span [ngClass]="dialogTitle == 'Delete' ? 'text-red-500': 'text-[#cf5c27]'">{{dialogTitle}}</span> this submission. Are you sure you want to continue?
        </p>
        <div class="flex flex-col justify-center my-5">
          <label class="block" for="Textarea1">Comments <sup>(optional)</sup></label>
          <textarea [formControl]="remarks" class="form-control" id="Textarea1" rows="4"></textarea>
        </div>
        <div class="flex justify-start gap-2">
          <button
            tuiButton
            type="button"
            size="m"
            [showLoader]="(sendingDecision | async) == true"
            (click)="sendDeleteOrCancelDecision(); observer.complete()"
          >
            Confirm
          </button>
          <button
            tuiButton
            appearance="accent"
            type="button"
            size="m"
            (click)="remarks.reset(); observer.complete()"
          >
            Cancel
          </button>
        </div>
      </ng-template>
    `,
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule, TuiButtonModule]
})
export class ActionButtonRenderer implements ICellRendererAngularComp, OnDestroy {
  /**
   * Current value of the cell in the grid
   */
  public cellValue: any;
  
  /**
   * The currently logged in user
   */
  public currentUser: any;

  /**
   * The title of the dialog to be dynamically changed
   */
  public dialogTitle: any;

  /**
   * The id of the currently active step in the workflow
   */
  public currentStepId: string;
  public isDeleting: string;
  public  workflowID: string;

  /**
   * Form Control for handling remarks
   */
  remarks = new FormControl('');

  /**
   * Boolean Subject for handling the status of the decision 
   */
  sendingDecision = new Subject<boolean>();
  destroy$ = new Subject();
  saveDialogSubscription: Subscription[] = [];

  constructor(
    private auth: AuthService,
    private router: Router,
    private workflowService: WorkflowsService,
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService
  ) {
    this.currentUser = this.auth.currentUserValue;
  }

  /**
   * gets called once before the renderer is used
   * @param params Cell Renderer Params provided by AG GRID
   */
  agInit(params: ICellRendererParams): void {
    this.cellValue = params;
  }

  /**
   * gets called whenever the cell refreshes
   * @param params Cell Renderer Params provided by AG GRID
   * @returns boolean
   */
  refresh(params: ICellRendererParams): boolean {
    this.cellValue = params
    return true;
  }

  /**
   * Method for storing workflow ID in current session
   * @param key submission key
   * @param submissionID submission id
   */
  setWorkflowID(key: string, submissionID: string) {
    setItemSession(StorageItem.formKey, key)
    setItemSession(StorageItem.editSubmissionId, submissionID)
  }

  /**
   * Method to check if the user has permission to view the delete/cancel btns
   * @param data 
   * @returns Boolean
   */
  checkEditDisableDeleteButton(data: any) {
    if (!this.currentUser.roles.includes('sysAdmin') &&
      data.subModuleId.accessType == "disabled" &&
      !data.activeStepUsers.includes(this.currentUser.id) &&
      !data.subModuleId.adminUsers.includes(this.currentUser.id)
    ) {
      return false;
    }
    return true;
  }

  /**
   * Method to store the form key and slug and re route to the workflow page for edit mode
   * @param id form id
   * @param key for key/slug
   */
  editWorkflowRoute(id: string, key: string) {
    setItemSession(StorageItem.previewMode, false)
    setItemSession(StorageItem.formKey, key)
    setItemSession(StorageItem.formID, id)
    this.router.navigate([`/modules`, getItemSession(StorageItem.moduleSlug), key, id])
  }

  /**
   * Method to store the form key and slug and re route to the workflow page for view only mode
   * @param id form id
   * @param key form key
   */
  viewWorkflowRoute(id: string, key: string) {
    setItemSession(StorageItem.previewMode, true)
    setItemSession(StorageItem.formKey, key)
    setItemSession(StorageItem.formID, id)
    this.router.navigate([`/modules`, getItemSession(StorageItem.moduleSlug), key, id])
  }

  /**
   * Method to check if the view button should be visible to user
   * @param data 
   * @returns boolean
   */
  checkViewButtonCondition(data: any) {
    if (this.currentUser &&
      !this.currentUser.roles.includes('sysAdmin') &&
      data.subModuleId.accessType == "disabled" &&
      !data.workFlowUsers.includes(this.currentUser.id) && 
      !data.subModuleId.adminUsers.includes(this.currentUser.id) &&
      !data.subModuleId.viewOnlyUsers.includes(this.currentUser.id)
    ) {
      return false;
    }
    return true;
  }

  /**
   * Opens the dialog for delete or cancel
   * @param content PolymorpheusContent
   * @param checkDecision The dialog type to open i.e. Cancel or Delete
   * @param workflowId workflow id
   * @param workflowStatus workflow status
   */
  showDeleteDialog(content: PolymorpheusContent<TuiDialogContext>, checkDecision: string, workflowId: string, workflowStatus: any): void {
    workflowStatus?.map(value => {
      this.currentStepId = value?.stepId
    })
    this.isDeleting = checkDecision;
    this.workflowID = workflowId;
    if(checkDecision == 'delete') {
      this.dialogTitle = 'Delete'
    }
    if(checkDecision == 'cancel') {
      this.dialogTitle = 'Cancel'
    }
    if(checkDecision == 'enable') {
      this.dialogTitle = 'Enable'
    }
    this.saveDialogSubscription.push(this.dialogs.open(content, {
      dismissible: true,
      closeable: true
    }).subscribe());
  }

  /**
   * Method for sending api call for the delete or cancel decisions
   */
  sendDeleteOrCancelDecision() {
    this.sendingDecision.next(true)
    let payload: any = {
      stepId: this.currentStepId,
      userId: this.currentUser?.id,
      remarks: this.remarks?.value || undefined,
      type: 'submittal'
    }
    if(this.isDeleting == 'delete') {
      Object.assign(payload, {status: 2})
      this.workflowService.updateSubmissionWorkflow(this.workflowID, payload).pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if(res) {
          this.sendingDecision.next(false)
          this.saveDialogSubscription.forEach(val => val.unsubscribe());
          this.remarks.reset();
          this.workflowService.actionComplete.emit(true)
        }
      })
    }
    if(this.isDeleting == 'cancel') {
      Object.assign(payload, {submissionStatus: 5});
      this.workflowService.updateSubmissionWorkflow(this.workflowID, payload).pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if(res) {
          this.sendingDecision.next(false)
          this.saveDialogSubscription.forEach(val => val.unsubscribe);
          this.remarks.reset();
          this.workflowService.actionComplete.emit(true)
        }
      })
    }
    if(this.isDeleting == 'enable') {
      Object.assign(payload, {submissionStatus: 2});
      this.workflowService.updateSubmissionWorkflow(this.workflowID, payload).pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if(res) {
          this.sendingDecision.next(false)
          this.saveDialogSubscription.forEach(val => val.unsubscribe);
          this.remarks.reset();
          this.workflowService.actionComplete.emit(true)
        }
      })
    }
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
    this.saveDialogSubscription.forEach(val => val.unsubscribe());
  }
}