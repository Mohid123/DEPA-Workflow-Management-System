import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subscription, throwError } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/modules/auth/auth.service';
import { NotificationsService } from '../core-services/notifications.service';
import { TuiNotification } from '@taiga-ui/core';

/**
 * Interceptor for handling "Unauthorized", "Forbidden", "Bad Request" and other invalid request error types on the client side
 * @implements HttpInterceptor
 */
@Injectable()
export class ServerErrorInterceptor implements HttpInterceptor, OnDestroy {

  subscription: Subscription[] = [];
  /**
   * @constructor
   * @param {AuthService} auth Auth Service holds the user's logged in status and JWT token.
   * Use auth service to check user's logged in status and fetch token to attach to headers
   */
  constructor(
    private auth: AuthService,
    private notif: NotificationsService
  ) {}

  /**
   * Interceptor method for attaching token to request. Angular provides this build in method for intercepting requests.
   * For more:
   *
   * @see [HttpInterceptor]{@link https://angular.io/api/common/http/HttpInterceptor}
   * @param {HttpRequest<unknown>} request
   * @param {HttpHandler} next
   * @returns {Observable<HttpEvent<unknown>>}
   */
  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if ([401, 403].includes(error.status) && this.auth.currentUserValue) {
          this.subscription.push(this.auth.logout()?.subscribe());
          this.notif.displayNotification('Your session has expired. Log in again to continue', 'Session Expired', TuiNotification.Error)
          window.location.reload()
          return throwError(error)
        } else if (error.status === 500) {
          return throwError(error);
        } else {
          return throwError(error);
        }
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscription.forEach(subs => subs.unsubscribe());
  }
}
