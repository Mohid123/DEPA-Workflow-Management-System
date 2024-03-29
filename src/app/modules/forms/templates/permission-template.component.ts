import { CommonModule } from "@angular/common";
import { Component, Inject, TemplateRef } from "@angular/core";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FormioUtils } from "@formio/angular";
import { TuiButtonModule, TuiDialogContext, TuiDialogService } from "@taiga-ui/core";
import { TuiCheckboxLabeledModule } from "@taiga-ui/kit";
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { DataTransportService } from "src/core/core-services/data-transport.service";
import { StorageItem, getItem, getItemSession } from "src/core/utils/local-storage.utils";

@Component({
  template: `
    <h2 class="text-lg font-semibold text-center">Set Permissions for users</h2>
    <div class="my-6">
      <ng-container *ngFor="let user of workflowApprovers; let i = index;">
        <div class="border-b border-gray-300 py-4 flex justify-start gap-x-3">
          <p class="font-semibold text-base mb-3 mr-4">{{user?.name}}</p>
          <tui-checkbox-labeled [formControl]="userFormControls[user.id].canEdit" (ngModelChange)="setCanView($event, user.id)" class="tui-space_top-1">
            Can Edit?
            <div class="text-gray-400">User will have the right to edit this component</div>
          </tui-checkbox-labeled>
          <tui-checkbox-labeled [formControl]="userFormControls[user.id].canView" class="tui-space_top-1">
            Can View?
            <div class="text-gray-400">User will have the right to only view this component</div>
          </tui-checkbox-labeled>
        </div>
      </ng-container>
    </div>
    <div class="flex justify-center gap-2 mt-5">
      <button
        tuiButton
        type="button"
        size="m"
        appearance="primary"
        (click)="submitPermission()"
      >
        Confirm
      </button>

      <button
        tuiButton
        type="button"
        size="m"
        appearance="accent"
        (click)="cancel()"
      >
        Cancel
      </button>
    </div>
  `,
  standalone: true,
  imports: [CommonModule, TuiButtonModule, ReactiveFormsModule, FormsModule, TuiCheckboxLabeledModule]
})

export class DialogTemplate {
  /**
   * Array of users that are part of the workflow
   */
  workflowApprovers: any[];

  /**
   * Form Controls for managing the data and permissions of the workflow users
   */
  userFormControls: { [userId: number]: { canEdit: FormControl, canView: FormControl } } = {};

  constructor(@Inject(POLYMORPHEUS_CONTEXT)
  private readonly context: TuiDialogContext<any, any>,
  @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
  private transport: DataTransportService
) {
  this.workflowApprovers = getItemSession(StorageItem.approvers) || [];
  /**
   * Checks if the user exists, then checks their permission status and based on that sets the permissions
   */
  if (this.workflowApprovers.length > 0) {
    this.workflowApprovers.forEach(user => {
      let userMatchFound = false;

      if (this.data && this.data?.permissions?.length > 0) {
        this.data?.permissions?.forEach(value => {
          if (user?.id == value?.id) {
            this.userFormControls[user.id] = {
              canEdit: new FormControl(value?.canEdit),
              canView: new FormControl(value?.canView)
            };
            userMatchFound = true;
          }
        });
      }
      if (!userMatchFound) {
        this.userFormControls[user.id] = {
          canEdit: new FormControl(false),
          canView: new FormControl(false)
        };
      }
    });
  } else {
    this.workflowApprovers.forEach(user => {
      this.userFormControls[user.id] = {
        canEdit: new FormControl(false),
        canView: new FormControl(false)
      };
    });
  }
}

/**
 * Method to set the view permission for the user
 * @param value any
 * @param id string
 */
  setCanView(value, id) {
    if(value == true) {
      this.userFormControls[id]?.canView?.setValue(true)
    }
  }

  /**
   * Get Dialog context data
   */
  get data(): any {
    return this.context.data;
  }

  /**
   * Submit the permissions after setting for users
   */
  submitPermission() {
    this.workflowApprovers = this.workflowApprovers?.map(user => {
      return {
        ...user,
        canEdit: this.userFormControls[user.id]?.canEdit?.value,
        canView: this.userFormControls[user.id]?.canView?.value,
      }
    })
    let updatedData = {
      ...this.data,
      permissions: this.workflowApprovers
    }
    this.transport.updatedComponent.emit(updatedData)
    this.context.completeWith(this.data);
  }

  /**
   * Cancel without setting permissions
   */
  cancel() {
    this.context.completeWith(null);
  }

  /**
   * Method to show permissions dialog
   * @param content Template which contains the dialog UI
   */
  showDialog(content: TemplateRef<TuiDialogContext>): void {
    this.dialogs.open(content, {dismissible: false, closeable: false, size: 'l'}).subscribe();
  }
}
