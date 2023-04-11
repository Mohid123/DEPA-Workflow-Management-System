import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiButtonModule } from '@taiga-ui/core';

@Component({
  selector: 'grid-small-app',
  standalone: true,
  imports: [CommonModule, TuiButtonModule],
  templateUrl: './grid-small-app.component.html',
  styleUrls: ['./grid-small-app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridSmallComponent {
  @Input() appData: any;
}
