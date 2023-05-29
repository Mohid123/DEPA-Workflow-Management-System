import { Inject, Injectable, } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { TuiDialogService } from '@taiga-ui/core';
import { Observable } from 'rxjs';
import {PolymorpheusComponent} from '@tinkoff/ng-polymorpheus';
import { DataTransportService, DialogState } from 'src/core/core-services/data-transport.service';
import { DashboardService } from '../../dashboard/dashboard.service';
import { ModuleGuardComponent } from '../templates/module-guard/module-guard.component';
import { StorageItem, getItem } from 'src/core/utils/local-storage.utils';

/**
 * Guard that protects the Submodule page from rerouting without user feedback on the unsaved data
 */
@Injectable({
  providedIn: 'root'
})

export class ModuleGuard implements CanActivate {

  /**
   * Injects aiga UI's Dialog Service, {@link DashboardService} and Angular's Router
   * @param dialog Inject Taiga UI's Dialog Service
   * @param transportService See {@link DashboardService}
   * @param router  A service that provides navigation among views and URL manipulation capabilities.
   */
  constructor(
    @Inject(TuiDialogService) private readonly dialog: TuiDialogService,
    private dashboard: DashboardService,
    private transportService: DataTransportService,
    private router: Router
  ) {}

  /**
   * Implements the Can Activate route method which uses an Interface that a class can implement to be a guard deciding if a route can be activated.
   * @param route Contains the information about a route associated with a component loaded in an outlet at a particular moment in time.
   * @param state This is a tree of activated route snapshots. Every node in this tree knows about the "consumed" URL segments, the extracted parameters, and the resolved data.
   * @returns Observable | UrlTree | Promise | boolean
   */
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree
  {
    let currentDialogState: DialogState;
    if(this.dashboard.moduleEditData.value !== null || getItem(StorageItem.publishAppValue)) {
      this.dialog.open(new PolymorpheusComponent(ModuleGuardComponent), {
        dismissible: false,
        closeable: false
      }).subscribe();
      this.transportService.dialogState.subscribe(val => {
        if(val === DialogState.DISCARD) {
          this.router.navigate([state.url]);
          return true
        }
        return false
      })
    }
    else {
      return true;
    }
    return false
  }
  
}
