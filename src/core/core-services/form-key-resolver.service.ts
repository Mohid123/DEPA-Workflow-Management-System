// submodule-resolver.service.ts
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { StorageItem, getItem } from 'src/core/utils/local-storage.utils';

@Injectable({
  providedIn: 'root'
})
export class FormKeyResolver implements Resolve<string> {
  resolve(route: ActivatedRouteSnapshot): Observable<string> | Promise<string> | string {
    const latestFormKey = getItem(StorageItem.formKey);
    return latestFormKey;
  }
}
