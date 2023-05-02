import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { AuthService } from '../auth.service';

/**
 * Injectable Guard that prevents access to pages without authentication
 */
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  /**
   * Uses Auth service as a dependancy to verify user's authorization status
   * @param authService 
   */
  constructor(private authService: AuthService, private router: Router) {}

  /**
   * Handles the gurading of routes based on user authorization
   * @param {ActivatedRouteSnapshot} route 
   * @param {RouterStateSnapshot} state 
   * @returns {boolean} Either true or false based on user's logged in status
   */
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      // logged in so return true
      return true;
    }
    debugger
    // not logged in so redirect to login page with the return url
    this.router.navigate(['/auth/login'], {
      queryParams: {},
    });
    debugger
    return false;
  }
}