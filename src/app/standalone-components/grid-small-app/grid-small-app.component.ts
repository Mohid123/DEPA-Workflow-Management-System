import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiButtonModule } from '@taiga-ui/core';

/**
 * Smaller card component to display Module data inside Grid View on the Home Page.
 */
@Component({
  selector: 'grid-small-app',
  standalone: true,
  imports: [CommonModule, TuiButtonModule],
  templateUrl: './grid-small-app.component.html',
  styleUrls: ['./grid-small-app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridSmallComponent {
  /**
   * @description Used to display the relevant data inside the card view
   */
  @Input() appData: any;
}
