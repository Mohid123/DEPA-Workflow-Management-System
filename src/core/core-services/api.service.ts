import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, of } from 'rxjs';
import { catchError, map, retry, shareReplay } from 'rxjs/operators';
import { ApiResponse, ErrorCode } from '../models/api-response.model';

/**
 * Object used to define headers that need to be attached to the request
 */
const headersConfig = {
  'LOCALE': 'en',
  'Accept': 'application/json',
  'access-control-allow-origin': '*'
};

/**
 * Central Factory Service for handling all api calls
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService<T> {

  /**
   * Uses Angular's HttpClient as a protected class
   * @param {HttpClient} http Performs HTTP requests.
   */
  constructor(
    protected http: HttpClient
  ) { }

  /**
   * Private method that handles the request headers
   * @returns {HttpHeaders} A new instance of HttpHeaders that will be attached to the request
   */
  private setHeaders(): HttpHeaders {
    const header = {
      ...headersConfig,
      'Content-Type': 'application/json',
    };
    return new HttpHeaders(header);
  }

  /**
   * Generic Get Request method for handling get requests
   * @param path The path or URL to send the request to
   * @param params Any parameters that need to be attached to the endpoint of the request URL
   * @returns {@link ApiResponse}
   */
  public get(
    path: string,
    params?: any
  ): Observable<ApiResponse<T>> {
    const options = {
      params: new HttpParams({ fromString: this.objectToQueryString(params) }),
      headers: this.setHeaders()
    };
    debugger
    return this.mapAndCatchError<T>(
      this.http.get<ApiResponse<T>>(`${environment.apiUrl}${path}`, options).pipe(shareReplay())
    );
  }

  /**
   * Generic Get Request method for handling get requests
   * @param path The path or URL to send the request to
   * @param params Any parameters that need to be attached to the endpoint of the request URL
   * @returns {@link ApiResponse}
   */
  public adlget(
    path: string,
    params?: any
  ): Observable<ApiResponse<T>> {
    const options = {
      params: params,
      headers: this.setHeaders()
    };
    return this.mapAndCatchError<T>(
      this.http.get<ApiResponse<T>>(`${environment.apiUrl}${path}`, options).pipe(shareReplay())
    );
  }

  /**
   * Generic POst Request method for handling post requests
   * @param path The path or URL to send the request to
   * @param body The payload object to send with the request
   * @returns {@link ApiResponse}
   */
  public post(
    path: string,
    body: Object = {},
    params?: any
  ): Observable<ApiResponse<T>> {

    const options = {
      params: params,
      headers: this.setHeaders()
    };
    return this.mapAndCatchError<T>(
      this.http.post<ApiResponse<T>>(
        `${environment.apiUrl}${path}`,
        JSON.stringify(body),
        options
      ).pipe(shareReplay())
    );
  }

  /**
   * Generic Post Request method for handling media and file uplaod requests
   * @param path The path or URL to send the request to
   * @param body The payload object to send with the request i.e image or file
   * @returns {@link ApiResponse}
   */
  public postMedia(
    path: string,
    body: any = {}
  ): Observable<ApiResponse<T>> {
    return this.mapAndCatchError<T>(
      this.http.post<ApiResponse<T>>(`${environment.apiUrl}${path}`, body).pipe(shareReplay()));
  }

  /**
   * Generic Put Request method for handling update requests
   * @param path The path or URL to send the request to
   * @param body The payload object to send with the request
   * @returns {@link ApiResponse}
   */
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
      ).pipe(shareReplay())
    );
  }

  /**
   * Generic Put Request method for handling update requests
   * @param path The path or URL to send the request to
   * @param body The payload object to send with the request
   * @returns {@link ApiResponse}
   */
  public patch(
    path: string,
    body: Object = {}
  ): Observable<ApiResponse<T>> {

    const options = { headers: this.setHeaders() };
    return this.mapAndCatchError<T>(
      this.http.patch<ApiResponse<T>>(
        `${environment.apiUrl}${path}`,
        JSON.stringify(body),
        options
      ).pipe(shareReplay())
    );
  }

  /**
   * Generic Delete Request method for handling delete requests
   * @param path The path or URL to send the request to
   * @param body The payload object to send with the request
   * @returns {@link ApiResponse}
   */
  public delete(
    path: string,
    body: Object = {}
  ): Observable<ApiResponse<T>> {

    const options = {
      headers: this.setHeaders(),
      body: JSON.stringify(body)
    };
    return this.mapAndCatchError<T>(
      this.http.delete<ApiResponse<T>>(`${environment.apiUrl}${path}`, options).pipe(shareReplay())
    );
  }

  /**
   * Converts the provided parameter object to a query string to be attached to URL endpoint 
   * @param obj Any object
   * @returns A query string to be attached to URL endpoint
   */
  private objectToQueryString(obj: any): string {
    const str = [];
    for (const p in obj)
      if (obj.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
      }
    return str.join('&');
  }

  /**
   * Factory method for handling API response. In case of success it maps the response to the {@link ApiResponse} object and returns. In case of error it maps to {@link ApiError} and pushes to {@link ApiResponse} Object and returns 
   * @param response The backend response Object OR the error message. Both are handled accordingly.
   * @returns {@link ApiResponse}
   */
  private mapAndCatchError<TData>(
    response: Observable<any>
  ): Observable<ApiResponse<TData>> {
    return response.pipe(
      retry(1),
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