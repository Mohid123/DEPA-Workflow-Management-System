import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Right side component to display Module data inside Grid View on the Home Page. Will display when no. of items in the grid are greater than 3
 */
@Component({
  selector: 'grid-side-app',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './grid-side-app.component.html',
  styleUrls: ['./grid-side-app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridSideAppComponent {

}
