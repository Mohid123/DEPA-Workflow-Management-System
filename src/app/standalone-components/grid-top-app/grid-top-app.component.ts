import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Module } from 'src/core/models/module.model';
import { RouterModule } from '@angular/router';
import { DataTransportService } from 'src/core/core-services/data-transport.service';

/**
 * The topmost card to display Module data inside Grid View on the Home Page. Will display if Grid contains at least 4 elements
 */
@Component({
  selector: 'grid-top-app',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './grid-top-app.component.html',
  styleUrls: ['./grid-top-app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridTopAppComponent {
  constructor(private transport: DataTransportService) {
  }
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
    this.editModule.emit(id)
    this.transport.moduleID.next(id)
   }
}
