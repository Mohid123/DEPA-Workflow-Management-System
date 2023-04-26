import { ChangeDetectionStrategy, Component, Inject, TemplateRef } from '@angular/core';
import {TuiDialogContext, TuiDialogService} from '@taiga-ui/core';
import { DataTransportService, DialogState } from 'src/core/core-services/data-transport.service';
import {POLYMORPHEUS_CONTEXT} from '@tinkoff/ng-polymorpheus';

@Component({
  selector: 'app-submodule-guard',
  templateUrl: './submodule-guard.component.html',
  styleUrls: ['./submodule-guard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubmoduleGuardComponent {
  constructor(
    @Inject(TuiDialogService) private readonly dialog: TuiDialogService,
    private transportService: DataTransportService,
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<boolean>,
    ) {}

  showDialog(content: TemplateRef<TuiDialogContext>): void {
    this.dialog.open(content).subscribe();
  }

  cancel() {
    this.transportService.saveDraftLocally({});
    this.transportService.sendFormBuilderData([{formTitle: '', components: []}]);
    this.transportService.dialogState.emit(DialogState.DISCARD);
    this.context.completeWith(true);
  }

  saveDraft() {

  }

  stayOnPage() {
    this.context.completeWith(true);
    this.transportService.dialogState.emit(DialogState.DEFAULT);
  }

}
