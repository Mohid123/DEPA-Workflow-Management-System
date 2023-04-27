import {Injectable} from '@angular/core';
import {PreloadingStrategy, Route} from '@angular/router';
import {Observable, of} from 'rxjs';

/**
 * Injectable that handles the preloading of modules where necessary
 */
@Injectable({
  providedIn: 'root'
})

export class CustomPreloadingStrategyService implements PreloadingStrategy {

  /**
   * Preload function that handles the module loading AOT.
   * @param {Route} route A configuration object that defines a single route
   * @param fn Function that returns an observable of the route
   * @returns {Observable<any>} Will return either an Observable function or null
   */
  preload(route: Route, fn: () => Observable<any>): Observable<any> {
    if (route.data && route.data['preload']) {
      return fn();
    }
    return of(null);
  }
}