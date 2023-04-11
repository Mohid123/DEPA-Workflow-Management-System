import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'grid-top-app',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './grid-top-app.component.html',
  styleUrls: ['./grid-top-app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridTopAppComponent {
  @Input() appData: any;
}
