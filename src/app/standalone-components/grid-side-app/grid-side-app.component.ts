import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

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
