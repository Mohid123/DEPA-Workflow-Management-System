import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-table-loader',
  templateUrl: './table-loader.component.html',
  styleUrls: ['./table-loader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule]
})
export class TableLoaderComponent {
  Arr = Array;
  num: number = 6;
}
