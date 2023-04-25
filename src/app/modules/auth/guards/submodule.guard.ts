import { Inject, Injectable, } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { TuiDialogService } from '@taiga-ui/core';
import { Observable } from 'rxjs';
import {PolymorpheusComponent} from '@tinkoff/ng-polymorpheus';
import { SubmoduleGuardComponent } from '../templates/submodule-guard/submodule-guard.component';
import { DataTransportService, DialogState } from 'src/core/core-services/data-transport.service';

@Injectable({
  providedIn: 'root'
})
export class SubmoduleGuard implements CanActivate {
  constructor(
    @Inject(TuiDialogService) private readonly dialog: TuiDialogService,
    private transportService: DataTransportService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree
  {
    let currentDialogState: DialogState;
    if(Object.keys(this.transportService.subModuleDraft.value)?.length > 0) {
      this.dialog.open(new PolymorpheusComponent(SubmoduleGuardComponent)).subscribe();
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
