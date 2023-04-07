import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from 'src/app/modules/auth/auth.service';

@Injectable()
export class ServerErrorInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private auth: AuthService
    ) {}

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