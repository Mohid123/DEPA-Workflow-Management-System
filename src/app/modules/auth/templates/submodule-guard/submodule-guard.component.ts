import { ChangeDetectionStrategy, Component, Inject, TemplateRef } from '@angular/core';
import {TuiDialogContext, TuiDialogService} from '@taiga-ui/core';
import { DataTransportService, DialogState } from 'src/core/core-services/data-transport.service';
import {POLYMORPHEUS_CONTEXT} from '@tinkoff/ng-polymorpheus';

/**
 * Template for showing the Popup when user reroutes from the Add Submodule page without saving data
 */
@Component({
  selector: 'app-submodule-guard',
  templateUrl: './submodule-guard.component.html',
  styleUrls: ['./submodule-guard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubmoduleGuardComponent {

  /**
   * Injects Taiga UI's Dialog service
   * @param dialog Taiga UI's Dialog Servoce
   * @param transportService Injectable for client side transport of data and state management between different pages
   * @param context Dialog Context
   */
  constructor(
    @Inject(TuiDialogService) private readonly dialog: TuiDialogService,
    private transportService: DataTransportService,
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<boolean>,
    ) {}

    /**
     * Uses Taiga UI's Dialog Context as a template reference and shows the dialog when prompted
     * @param content epresents an embedded template that can be used to instantiate embedded views. 
     */
    showDialog(content: TemplateRef<TuiDialogContext>): void {
      this.transportService.closeAllDialogs.push(this.dialog.open(content).subscribe());
    }

    /**
     * Handles the reroute of user after the decision to redirect. Clears all submodule data from state
     */
    cancel() {
      this.transportService.saveDraftLocally({});
      this.transportService.sendFormBuilderData([{title: '', key: '', display: '', components: []}]);
      this.transportService.dialogState.emit(DialogState.DISCARD);
      this.context.completeWith(true);
    }

    /**
     * Saves the draft of the submodule if user selects the "Save as Draft" option
     */
    saveDraft() {

    }

    /**
     * Prevents reroute and maintains current data state
     */
    stayOnPage() {
      this.context.completeWith(true);
      this.transportService.dialogState.emit(DialogState.DEFAULT);
    }

}
