import { CommonModule } from "@angular/common";
import { Component, Inject, TemplateRef } from "@angular/core";
import { TuiButtonModule, TuiDialogContext, TuiDialogService } from "@taiga-ui/core";
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';

@Component({
  template: `
    <h2 class="text-lg font-semibold text-center">Set Permissions</h2>
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
  imports: [CommonModule, TuiButtonModule]
})

export class DialogTemplate {
  constructor(@Inject(POLYMORPHEUS_CONTEXT)
  private readonly context: TuiDialogContext<any, any>,
  @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
) {}

  get data(): any {
    return this.context.data;
  }

  submitPermission() {
    console.log(this.data)
    this.context.completeWith(this.data);
  }

  cancel() {
    this.context.completeWith(this.data);
  }

  showDialog(content: TemplateRef<TuiDialogContext>): void {
    this.dialogs.open(content, {dismissible: false, closeable: false}).subscribe();
  }
}
