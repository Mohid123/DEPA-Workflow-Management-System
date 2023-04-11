import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, exhaustMap, finalize, map, shareReplay, tap } from 'rxjs/operators';
import { RegisterModel } from '../auth/models/register.model';
import { getItem, setItem, StorageItem } from 'src/core/utils/local-storage.utils';
import { SignInResponse } from 'src/core/models/sign-in-response.model';
import { ApiService } from 'src/core/core-services/api.service';
import { User } from 'src/core/models/user.model';
import { NotificationsService } from 'src/core/core-services/notifications.service';
import { ApiResponse } from 'src/core/models/api-response.model';
import { AuthCredentials } from 'src/core/models/auth-credentials.model';
import { TuiNotification } from '@taiga-ui/core';

type AuthApiData = SignInResponse | any;

@Injectable({
  providedIn: 'root',
})
export class AuthService extends ApiService<AuthApiData> {

  // public fields
  currentUser$: Observable<User | null>;
  isLoading$: Observable<boolean>;
  currentUserSubject: BehaviorSubject<User | null>;
  isLoadingSubject: BehaviorSubject<boolean>;
  isLoggingIn: BehaviorSubject<boolean> = new BehaviorSubject(false);

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  set currentUserValue(user: User | null) {
    this.currentUserSubject.next(user);
  }

  get JwtToken(): string {
    return getItem(StorageItem.JwtToken)?.toString() || '';
  }

  get RefreshToken(): string {
    return getItem(StorageItem.RefreshToken)?.toString() || '';
  }

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

  // public methods
  login(params: AuthCredentials) {
    this.isLoadingSubject.next(true);
    return this.post('/auth/login', params).pipe(
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

  loginWithActiveDirectory(params: {username: string, password: string}) {
    this.isLoadingSubject.next(true);
    return this.post('/auth/login/active-directory', params).pipe(
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

  logout() {
    this.currentUserSubject.next(null);
    setItem(StorageItem.User, null);
    setItem(StorageItem.JwtToken, null);
    this.post('/auth/logout', {refreshToken: this.RefreshToken}).subscribe();
    setItem(StorageItem.RefreshToken, null);
    this.router.navigate(['/auth/login'], {
      queryParams: {},
    });
  }

  registration(user: RegisterModel) {
    this.isLoadingSubject.next(true);
    return this.post('/add_url_here', user).pipe(
      map((user: ApiResponse<SignInResponse>) => {
        this.isLoadingSubject.next(false);
        return user;
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  updateUser(user:User) {
    if (user) {
      this.currentUserSubject.next(user);
      setItem(StorageItem.User, user);
    }
  }

  getUser(id: string) {
    return this.get(`/users/${id}`).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        return res.data
      }
    }))
  }

}