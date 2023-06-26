// submodule-resolver.service.ts
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { StorageItem, getItem } from 'src/core/utils/local-storage.utils';

@Injectable({
  providedIn: 'root'
})
export class WorkflowResolver implements Resolve<string> {
  resolve(route: ActivatedRouteSnapshot): Observable<string> | Promise<string> | string {
    const latestSubmoduleSlug = getItem(StorageItem.subModuleSlug);
    return latestSubmoduleSlug;
  }
}
