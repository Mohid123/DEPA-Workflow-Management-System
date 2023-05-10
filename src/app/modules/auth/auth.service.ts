import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, exhaustMap, finalize, map, shareReplay, tap } from 'rxjs/operators';
import { getItem, removeItem, setItem, StorageItem } from 'src/core/utils/local-storage.utils';
import { SignInResponse } from 'src/core/models/sign-in-response.model';
import { ApiService } from 'src/core/core-services/api.service';
import { User } from 'src/core/models/user.model';
import { NotificationsService } from 'src/core/core-services/notifications.service';
import { ApiResponse } from 'src/core/models/api-response.model';
import { AuthCredentials } from 'src/core/models/auth-credentials.model';
import { TuiNotification } from '@taiga-ui/core';

/**
 * Type defintion that is provided as the type of the Api Service
 * @type
 */
type AuthApiData = SignInResponse | any;

/**
 * Authentication Service
 */
@Injectable({
  providedIn: 'root',
})

export class AuthService extends ApiService<AuthApiData> {
  /**
   * Current user observable
   */
  currentUser$: Observable<User | null>;

  /**
   * Observable to handle whether response is complete, pending or failed
   */
  isLoading$: Observable<boolean>;

  /**
   * The BehaviorSubject that holds the user data after login
   */
  currentUserSubject: BehaviorSubject<User | null>;

  /**
   * Subject to handle whether response is complete, pending or failed
   */
  isLoadingSubject: BehaviorSubject<boolean>;

  /**
   * Checks whether the login process is complete, pending or failed
   */
  isLoggingIn: BehaviorSubject<boolean> = new BehaviorSubject(false);

  /**
   * Getter for getting the lates user data
   */
  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Setter for updating user data
   */
  set currentUserValue(user: User | null) {
    this.currentUserSubject.next(user);
  }

  /**
   * Getter for getting JWT token
   */
  get JwtToken(): string {
    return getItem(StorageItem.JwtToken)?.toString() || '';
  }

  /**
   * Getter for getting the refresh token
   */
  get RefreshToken(): string {
    return getItem(StorageItem.RefreshToken)?.toString() || '';
  }

  /**
   * Extends Api Service and handles all authentication apis
   * @param http Performs HTTP requests.
   * @param router A service that provides navigation among views and URL manipulation capabilities.
   * @param notif Injectable for handling custom notifications throughout the panel
   */
  constructor(
    protected override http: HttpClient,
    private router: Router,
    private notif: NotificationsService
  ) {
    super(http);
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.currentUserSubject = new BehaviorSubject<User | null>(<User>getItem(StorageItem.User));
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.isLoading$ = this.isLoadingSubject.asObservable();
  }

  /**
   * Login function
   * @param params Authentication or Login credentials provided by user
   * @returns User object or null
   */
  login(params: AuthCredentials) {
    this.isLoadingSubject.next(true);
    return this.post('/auth/login', params).pipe(
      shareReplay(),
      map((result: ApiResponse<any>) => {
        if (!result.hasErrors()) {
          setItem(StorageItem.User, result?.data?.user || null);
          setItem(StorageItem.JwtToken, result?.data?.tokens?.access?.token || null);
          setItem(StorageItem.RefreshToken, result?.data?.tokens?.refresh?.token || null);
          if(result?.data?.user)
          this.currentUserSubject.next(result?.data?.user);
          return result
        }
        else {
          this.notif.displayNotification(result.errors[0]?.error?.message || 'Failed to send request to server', 'Login Failed!', TuiNotification.Error);
          throw result.errors[0].error?.message
        }
      }),
      exhaustMap((res) => {
        if (res?.data?.user) {
          return this.get(`/users/${res?.data?.user?.id}`)
        } else {
          return of(null);
        }
      }),
      tap((res) => {
        if(res && !res?.hasErrors()) {
          this.updateUser(res.data)
        }
      }),
      catchError((err) => {
        throw err
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  /**
   * Login user via Active Directory or Windows users
   * @param params Authentication or Login credentials provided by user
   * @returns User object or null
   */
  loginWithActiveDirectory(params: {username: string, password: string}) {
    this.isLoadingSubject.next(true);
    return this.post('/auth/login/active-directory', params).pipe(
      shareReplay(),
      map((result: ApiResponse<any>) => {
        if (!result.hasErrors()) {
          setItem(StorageItem.User, result?.data?.user || null);
          setItem(StorageItem.JwtToken, result?.data?.tokens?.access?.token || null);
          setItem(StorageItem.RefreshToken, result?.data?.tokens?.refresh?.token || null);
          if(result?.data?.user)
          this.currentUserSubject.next(result?.data?.user);
          return result
        }
        else {
          this.notif.displayNotification(result.errors[0]?.error?.message || 'Failed to authenticate', 'Login Failed!', TuiNotification.Error);
          throw result.errors[0].error?.message
        }
      }),
      exhaustMap((res) => {
        if (res?.data?.user) {
          return this.get(`/users/${res?.data?.user?.id}`)
        } else {
          return of(null);
        }
      }),
      tap((res) => {
        if(res && !res?.hasErrors()) {
          this.updateUser(res.data)
        }
      }),
      catchError((err) => {
        throw err
      }),
      finalize(() => this.isLoadingSubject.next(false))
    )
  }

  /**
   * Logout user and remove all pertaining data from state
   */
  logout(): Observable<ApiResponse<any>> {
    if(this.RefreshToken && this.RefreshToken != "") {
      this.currentUserSubject.next(null);
      return this.post('/auth/logout', {refreshToken: this.RefreshToken})
      .pipe(shareReplay(), map((res: ApiResponse<any>) => {
        if(!res.hasErrors()) {
          removeItem(StorageItem.RefreshToken);
          removeItem(StorageItem.publishAppValue);
          removeItem(StorageItem.activeIndex);
          removeItem(StorageItem.User);
          removeItem(StorageItem.JwtToken);
          this.router.navigate(['/auth/login'], {
            queryParams: {},
          });
          return res
        }
        else {
          removeItem(StorageItem.publishAppValue);
          removeItem(StorageItem.activeIndex);
          removeItem(StorageItem.RefreshToken);
          removeItem(StorageItem.User);
          removeItem(StorageItem.JwtToken);
          this.router.navigate(['/auth/login'], {
            queryParams: {},
          });
          this.notif.displayNotification(res.errors[0]?.error?.message || 'Something went wrong', 'Logout Failed!', TuiNotification.Error);
          return res
        }
      }));
    }
    return null
  }

  /**
   * Updates user data in the state
   * @param user User Object
   */
  updateUser(user:User) {
    if (user) {
      this.currentUserSubject.next(user);
      setItem(StorageItem.User, user);
    }
  }

  /**
   * Get latest user data and update state of user info
   * @param id The id of the current user
   * @returns latest user data fronm server
   */
  getUser(id: string) {
    return this.get(`/users/${id}`).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        return res.data
      }
    }))
  }

}
