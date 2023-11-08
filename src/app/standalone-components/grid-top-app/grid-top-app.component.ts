import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DataTransportService } from 'src/core/core-services/data-transport.service';
import { AuthService } from 'src/app/modules/auth/auth.service';
import { StorageItem, setItemSession } from 'src/core/utils/local-storage.utils';
import { TuiBadgeModule } from '@taiga-ui/kit';
import { TuiHintModule } from '@taiga-ui/core/directives/hint';

/**
 * The topmost card to display Module data inside Grid View on the Home Page. Will display if Grid contains at least 4 elements
 */
@Component({
  selector: 'grid-top-app',
  standalone: true,
  imports: [CommonModule, RouterModule, TuiBadgeModule, TuiHintModule],
  templateUrl: './grid-top-app.component.html',
  styleUrls: ['./grid-top-app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridTopAppComponent {
  /**
   * The currently logged in user
   */
  currentUser: any;

  /**
   * Global Variable for checking the role of the currently logged in user
   */
  userRoleCheck: any;

  constructor(private transport: DataTransportService, private auth: AuthService) {
    this.currentUser = this.auth.currentUserValue;
    this.userRoleCheck = this.auth.checkIfRolesExist('sysAdmin')
  }

  /**
   * Method to check whether the user has access to modify/view the app
   * @param data 
   * @returns boolean
   */
  checkAccess(data: any) {
    if (this.userRoleCheck == false && data?.accessType == "disabled" && !data.authorizedUsers.includes(this.currentUser.id)) {
      return false;
    }
    return true;
  }
    /**
   * Used to display the relevant data inside the card view
   */
  @Input() appData: any;

  /**
   * Event Emitter for handling module deletion
   */
  @Output() deleteModule = new EventEmitter();

  /**
   * Event Emitter for handling module updation
   */
  @Output() editModule = new EventEmitter();

  /**
   * Stores the module Code in session storage
   * @param id The module or app ID
   * @param code The key/slug of the app/module
   */
  storeModuleID(id: string, code: string) {
    this.transport.moduleID.next(id);
    setItemSession(StorageItem.moduleSlug, code);
  }

  /**
   * Method to emit an event that signals the app for deletion
   * @param id The module or app ID 
   */
  deleteModuleEvent(id: string) {
    this.deleteModule.emit(id)
  }

  /**
   * Method to emit event that signals app for updation
   * @param id The module or app ID
   * @param code Module Slug
   * @param title Module Title
   */
  editModuleEvent(id: string, code: string, title: string) {
    setItemSession(StorageItem.moduleSlug, code);
    setItemSession(StorageItem.editmoduleTitle, title);
    setItemSession(StorageItem.editmoduleId, id);
    this.editModule.emit(id)
    this.transport.moduleID.next(id)
  }

  /**
   * @ignore
   * @param value 
   * @returns 
   */
  checkIfUserisAdmin(value: any[]): boolean {
    return value?.includes(this.currentUser?.id)
  }

  /**
   * @ignore
   * @param value 
   * @returns 
   */
  checkIfUserisViewOnly(value: any[]): boolean {
    return value?.includes(this.currentUser?.id)
  }
}
