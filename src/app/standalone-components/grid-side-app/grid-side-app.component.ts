import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Module } from 'src/core/models/module.model';
import { RouterModule } from '@angular/router';

/**
 * Right side component to display Module data inside Grid View on the Home Page. Will display when no. of items in the grid are greater than 3
 */
@Component({
  selector: 'grid-side-app',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './grid-side-app.component.html',
  styleUrls: ['./grid-side-app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridSideAppComponent {
   /**
   * Used to display the relevant data inside the card view
   */
   @Input() appData: Module;

   @Output() deleteModule = new EventEmitter();
   @Output() editModule = new EventEmitter();


   deleteModuleEvent(id: string) {
    this.deleteModule.emit(id)
   }

   editModuleEvent(id: string) {
    this.editModule.emit(id)
   }
}
