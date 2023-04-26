import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from 'src/app/modules/auth/auth.service';
import { environment } from 'src/environments/environment';

/**
 * Interceptor for checking user's authentication status and attaching JWT token to request headers to server side requests
 * @implements HttpInterceptor
 */
@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  /**
   * @constructor
   * @param {AuthService} authService Auth Service holds the user's logged in status and JWT token.
   * Use auth service to check user's logged in status and fetch token to attach to headers
   */
  constructor(private authService: AuthService) { }

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
    const isLoggedIn = !!this.authService.currentUserValue;
    const token = this.authService.JwtToken;
    const isApiUrl = request.url.startsWith(environment.apiUrl);

    if (isLoggedIn && isApiUrl) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(request).pipe(
      map((response: any) => {
        if (response.status) {
          response.body = {
            status: [200,201,204].includes(response.status),
            data: response.body,
          };
        }
        return response;
      })
    );
  }
}