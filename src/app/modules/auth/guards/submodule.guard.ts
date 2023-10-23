import { Inject, Injectable, OnDestroy } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { TuiDialogService } from '@taiga-ui/core';
import { Observable, Subject, take, takeUntil } from 'rxjs';
import {PolymorpheusComponent} from '@tinkoff/ng-polymorpheus';
import { SubmoduleGuardComponent } from '../templates/submodule-guard/submodule-guard.component';
import { DataTransportService, DialogState } from 'src/core/core-services/data-transport.service';
import { StorageItem, getItem, removeItem } from 'src/core/utils/local-storage.utils';
import { Location } from '@angular/common';

/**
 * Guard that protects the Submodule page from rerouting without user feedback on the unsaved data
 */
@Injectable({
  providedIn: 'root'
})

export class SubmoduleGuard implements CanActivate, OnDestroy {

  /**
   * Injects aiga UI's Dialog Service, {@link DataTransportService} and Angular's Router
   * @param dialog Inject Taiga UI's Dialog Service
   * @param transportService See {@link DataTransportService}
   * @param router  A service that provides navigation among views and URL manipulation capabilities.
   */
  constructor(
    @Inject(TuiDialogService) private readonly dialog: TuiDialogService,
    private transportService: DataTransportService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private location: Location
  ) {}
  
  destroy$ = new Subject();

  /**
   * Implements the Can Activate route method which uses an Interface that a class can implement to be a guard deciding if a route can be activated.
   * @param route Contains the information about a route associated with a component loaded in an outlet at a particular moment in time.
   * @param state This is a tree of activated route snapshots. Every node in this tree knows about the "consumed" URL segments, the extracted parameters, and the resolved data.
   * @returns Observable | UrlTree | Promise | boolean
   */
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree
  {
    let currentDialogState: DialogState;
    if(Object.keys(this.transportService.subModuleDraft.value)?.length > 0) {
      this.transportService.closeAllDialogs.push(this.dialog.open(new PolymorpheusComponent(SubmoduleGuardComponent), {
        dismissible: true,
        closeable: true
      }).subscribe());
      this.transportService.dialogState.pipe(takeUntil(this.destroy$)).subscribe(val => {
        if(val === DialogState.DISCARD) {
          this.routeToBasedOnPreviousPage()
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

  routeToBasedOnPreviousPage() {
    this.activatedRoute.queryParams.pipe(take(1)).subscribe(val => {
      if(Object.keys(val).length > 0) {
        return this.router.navigate(['/dashboard/home'])
        
      }
      else {
        return this.location.back()
      }
    })
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
  
}
