import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Module } from 'src/core/models/module.model';
import { RouterModule } from '@angular/router';
import { DataTransportService } from 'src/core/core-services/data-transport.service';

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
  constructor(private transport: DataTransportService) {}
   /**
   * Used to display the relevant data inside the card view
   */
   @Input() appData: Module;

   @Output() deleteModule = new EventEmitter();
   @Output() editModule = new EventEmitter();

   storeModuleID(id: string) {
    this.transport.moduleID.next(id)
  }

   deleteModuleEvent(id: string) {
    this.deleteModule.emit(id)
   }

   editModuleEvent(id: string) {
    this.editModule.emit(id);
    this.transport.moduleID.next(id)
   }
}
