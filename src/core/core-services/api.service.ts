import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, of } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { ApiResponse, ErrorCode } from '../models/api-response.model';

const headersConfig = {
  'LOCALE': 'en',
  'Accept': 'application/json',
  'access-control-allow-origin': '*'
};

@Injectable({
  providedIn: 'root'
})
export class ApiService<T> {

  constructor(
    protected http: HttpClient
  ) { }

  private setHeaders(): HttpHeaders {
    const header = {
      ...headersConfig,
      'Content-Type': 'application/json',
    };
    return new HttpHeaders(header);
  }

  public get(
    path: string,
    params?: any
  ): Observable<ApiResponse<T>> {
    const options = {
      params: new HttpParams({ fromString: this.objectToQueryString(params) }),
      headers: this.setHeaders()
    };
    return this.mapAndCatchError<T>(
      this.http.get<ApiResponse<T>>(`${environment.apiUrl}${path}`, options)
    );
  }

  public post(
    path: string,
    body: Object = {}
  ): Observable<ApiResponse<T>> {

    const options = { headers: this.setHeaders() };
    return this.mapAndCatchError<T>(
      this.http.post<ApiResponse<T>>(
        `${environment.apiUrl}${path}`,
        JSON.stringify(body),
        options
      )
    );
  }

  public postMedia(
    path: string,
    body: any = {}
  ): Observable<ApiResponse<T>> {
    return this.mapAndCatchError<T>(
      this.http.post<ApiResponse<T>>(`${environment.apiUrl}${path}`, body));
  }

  public put(
    path: string,
    body: Object = {}
  ): Observable<ApiResponse<T>> {

    const options = { headers: this.setHeaders() };
    return this.mapAndCatchError<T>(
      this.http.put<ApiResponse<T>>(
        `${environment.apiUrl}${path}`,
        JSON.stringify(body),
        options
      )
    );
  }

  public delete(
    path: string,
    body: Object = {}
  ): Observable<ApiResponse<T>> {

    const options = {
      headers: this.setHeaders(),
      body: JSON.stringify(body)
    };
    return this.mapAndCatchError<T>(
      this.http.delete<ApiResponse<T>>(`${environment.apiUrl}${path}`, options)
    );
  }

  private objectToQueryString(obj: any): string {
    const str = [];
    for (const p in obj)
      if (obj.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
      }
    return str.join('&');
  }

  private mapAndCatchError<TData>(
    response: Observable<any>
  ): Observable<ApiResponse<TData>> {
    return response.pipe(
      retry(2),
      map((r: ApiResponse<TData>) => {
        const result = new ApiResponse<TData>();
        Object.assign(result, r);
        return result;
      }),
      catchError((err: HttpErrorResponse) => {
        const result = new ApiResponse<TData>();
        // if err.error is not ApiResponse<TData> e.g. connection issue
        if (
          err.error instanceof ErrorEvent ||
          err.error instanceof ProgressEvent
        ) {
          result.errors.push({
            code: ErrorCode.UnknownError,
            text: 'Unknown error.'
          });
        } else {
          result.errors.push({
            code: err.status,
            text: err.message,
            error: err.error
          });
          // Object.assign(result, err.error)
        }
        return of(result);
      })
    );
  }
}