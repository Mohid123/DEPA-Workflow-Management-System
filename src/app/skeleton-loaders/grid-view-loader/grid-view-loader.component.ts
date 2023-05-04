import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * @ignore
 */
@Component({
  selector: 'app-grid-view-loader',
  templateUrl: './grid-view-loader.component.html',
  styleUrls: ['./grid-view-loader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridViewLoaderComponent {
  Arr = Array;
  num: number = 4;
}
