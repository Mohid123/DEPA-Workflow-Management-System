import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Module } from 'src/core/models/module.model';
import { RouterModule } from '@angular/router';
import { DataTransportService } from 'src/core/core-services/data-transport.service';
import { AuthService } from 'src/app/modules/auth/auth.service';
import { StorageItem, setItem } from 'src/core/utils/local-storage.utils';

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
  currentUser: any;

  constructor(private transport: DataTransportService, private auth: AuthService) {
    this.currentUser = this.auth.currentUserValue;
  }
    /**
   * Used to display the relevant data inside the card view
   */
  @Input() appData: any;

  @Output() deleteModule = new EventEmitter();
  @Output() editModule = new EventEmitter();

  storeModuleID(id: string, code: string) {
    this.transport.moduleID.next(id);
    setItem(StorageItem.moduleSlug, code);
  }

   deleteModuleEvent(id: string) {
    this.deleteModule.emit(id)
   }

   editModuleEvent(id: string) {
    this.editModule.emit(id)
    this.transport.moduleID.next(id)
   }
}
