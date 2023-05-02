import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Module } from 'src/core/models/module.model';

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
   /**
   * Used to display the relevant data inside the card view
   */
   @Input() appData: Module;
}
