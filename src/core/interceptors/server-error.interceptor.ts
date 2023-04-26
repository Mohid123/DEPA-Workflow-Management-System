import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from 'src/app/modules/auth/auth.service';

/**
 * Interceptor for handling "Unauthorized", "Forbidden", "Bad Request" and other invalid request error types on the client side
 * @implements HttpInterceptor
 */
@Injectable()
export class ServerErrorInterceptor implements HttpInterceptor {

  /**
   * @constructor
   * @param {AuthService} auth Auth Service holds the user's logged in status and JWT token.
   * Use auth service to check user's logged in status and fetch token to attach to headers
   */
  constructor(
    private auth: AuthService
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
        if ([401, 403].includes(error.status)) {
          this.auth.logout();
          return throwError(error);
        } else if (error.status === 500) {
          return throwError(error);
        } else {
          return throwError(error);
        }
      }),
    );
  }
}