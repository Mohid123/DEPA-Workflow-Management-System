// submodule-resolver.service.ts
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { StorageItem, getItem, getItemSession } from 'src/core/utils/local-storage.utils';

@Injectable({
  providedIn: 'root'
})
export class SubmoduleResolver implements Resolve<string> {
  resolve(route: ActivatedRouteSnapshot): Observable<string> | Promise<string> | string {
    const latestSubmoduleSlug = getItemSession(StorageItem.moduleSlug);
    return latestSubmoduleSlug;
  }
}
