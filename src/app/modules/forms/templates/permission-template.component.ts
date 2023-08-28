import { CommonModule } from "@angular/common";
import { Component, Inject, TemplateRef } from "@angular/core";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TuiButtonModule, TuiDialogContext, TuiDialogService } from "@taiga-ui/core";
import { TuiCheckboxLabeledModule } from "@taiga-ui/kit";
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { DataTransportService } from "src/core/core-services/data-transport.service";
import { StorageItem, getItem } from "src/core/utils/local-storage.utils";

@Component({
  template: `
    <h2 class="text-lg font-semibold text-center">Set Permissions for users</h2>
    <div class="my-6">
      <ng-container *ngFor="let user of workflowApprovers; let i = index;">
        <div class="border-b border-gray-300 py-4">
          <p class="font-semibold text-base mb-3">{{user?.name}}</p>
          <tui-checkbox-labeled [formControl]="userFormControls[user.id].canEdit" class="tui-space_top-3">
            Can Edit?
            <div class="text-gray-400">User will have the right to edit this component</div>
          </tui-checkbox-labeled>
          <tui-checkbox-labeled [formControl]="userFormControls[user.id].canView" class="tui-space_top-3">
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
  workflowApprovers: any[];
  userFormControls: { [userId: number]: { canEdit: FormControl, canView: FormControl } } = {};

  constructor(@Inject(POLYMORPHEUS_CONTEXT)
  private readonly context: TuiDialogContext<any, any>,
  @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
  private transport: DataTransportService
) {
  this.workflowApprovers = getItem(StorageItem.approvers) || [];
  if(this.workflowApprovers.length > 0) {
    this.workflowApprovers.forEach(user => {
      this.userFormControls[user.id] = {
        canEdit: new FormControl(false),
        canView: new FormControl(true)
      };
    });
  }
}

  get data(): any {
    return this.context.data;
  }

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

  cancel() {
    this.context.completeWith(null);
  }

  showDialog(content: TemplateRef<TuiDialogContext>): void {
    this.dialogs.open(content, {dismissible: false, closeable: false}).subscribe();
  }
}
