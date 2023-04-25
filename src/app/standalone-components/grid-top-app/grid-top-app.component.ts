import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * The topmost card to display Module data inside Grid View on the Home Page. Will display if Grid contains at least 4 elements
 */
@Component({
  selector: 'grid-top-app',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './grid-top-app.component.html',
  styleUrls: ['./grid-top-app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridTopAppComponent {
    /**
   * @description Used to display the relevant data inside the card view
   */
  @Input() appData: any;
}
