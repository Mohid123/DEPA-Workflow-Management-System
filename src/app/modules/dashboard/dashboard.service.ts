import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TuiNotification } from '@taiga-ui/core';
import { BehaviorSubject, Observable, Subject, map, shareReplay } from 'rxjs';
import { ApiService } from 'src/core/core-services/api.service';
import { NotificationsService } from 'src/core/core-services/notifications.service';
import { ApiResponse } from 'src/core/models/api-response.model';
import { Module } from 'src/core/models/module.model';
import { User } from 'src/core/models/user.model';
import { StorageItem, setItem } from 'src/core/utils/local-storage.utils';

/**
 * Interface for Breadcrumb navigation
 */
interface BreadCrumbs {
  /**
   * breadcrumb caption
   */
  caption: string,
  code?: string

  /**
   * The route link or path to enable navigation
   */
  routerLink: string
}

/**
 * Dashboard service that handles data manipulation and api handling related to the dashboard module
 */
@Injectable({
  providedIn: 'root'
})

export class DashboardService extends ApiService<any> {

  creatingModule = new Subject<boolean>();

  moduleEditData = new BehaviorSubject<any>(null);

  submissionId = new BehaviorSubject<any>('');

  public excludeIdEmitter = new EventEmitter();

  emailContent: any = `
  <div class="ck ck-content ck-editor__editable ck-rounded-corners ck-editor__editable_inline ck-blurred" lang="en" dir="ltr" role="textbox" aria-label="Editor editing area: main" contenteditable="true">
  <h1 class="ck-placeholder" data-placeholder="Type your title"><br data-cke-filler="true"></h1>
  <figure class="image ck-widget ck-widget_with-resizer" contenteditable="false" data-placeholder="Type or paste your content here.">
    <img src="https://depa.com/images/logo.png">
    <div class="ck ck-reset_all ck-widget__type-around">
      <div class="ck ck-widget__type-around__button ck-widget__type-around__button_before" title="Insert paragraph before block" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 8">
          <path d="M9.055.263v3.972h-6.77M1 4.216l2-2.038m-2 2 2 2.038"></path>
        </svg>
      </div>
      <div class="ck ck-widget__type-around__button ck-widget__type-around__button_after" title="Insert paragraph after block" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 8">
          <path d="M9.055.263v3.972h-6.77M1 4.216l2-2.038m-2 2 2 2.038"></path>
        </svg>
      </div>
      <div class="ck ck-widget__type-around__fake-caret"></div>
    </div>
    <div class="ck ck-reset_all ck-widget__resizer ck-hidden">
      <div class="ck-widget__resizer__handle ck-widget__resizer__handle-top-left"></div>
      <div class="ck-widget__resizer__handle ck-widget__resizer__handle-top-right"></div>
      <div class="ck-widget__resizer__handle ck-widget__resizer__handle-bottom-right"></div>
      <div class="ck-widget__resizer__handle ck-widget__resizer__handle-bottom-left"></div>
      <div class="ck ck-size-view" style="display: none;"></div>
    </div>
  </figure>
  <figure class="table ck-widget ck-widget_with-selection-handle" contenteditable="false">
    <div class="ck ck-widget__selection-handle">
      <svg class="ck ck-icon ck-reset_all-excluded ck-icon_inherit-color" viewBox="0 0 16 16">
        <path d="M4 0v1H1v3H0V.5A.5.5 0 0 1 .5 0H4zm8 0h3.5a.5.5 0 0 1 .5.5V4h-1V1h-3V0zM4 16H.5a.5.5 0 0 1-.5-.5V12h1v3h3v1zm8 0v-1h3v-3h1v3.5a.5.5 0 0 1-.5.5H12z"></path>
        <path fill-opacity=".256" d="M1 1h14v14H1z"></path>
        <g class="ck-icon__selected-indicator">
          <path d="M7 0h2v1H7V0zM0 7h1v2H0V7zm15 0h1v2h-1V7zm-8 8h2v1H7v-1z"></path>
          <path fill-opacity=".254" d="M1 1h14v14H1z"></path>
        </g>
      </svg>
    </div>
    <table>
      <tbody>
        <tr>
          <td class="ck-editor__editable ck-editor__nested-editable" role="textbox" contenteditable="true">
            <h3 style="margin-left:80px;">Hello!</h3>
            <p style="margin-left:80px;"><br data-cke-filler="true"></p>
            <p style="margin-left:80px;">{{#each formsData}}</p>
            <p style="margin-left:120px;">{{formId.title}}</p>
            <p style="margin-left:160px;">{{@key}} : {{this}}</p>
            <p style="margin-left:160px;">{{@key}} : {{this}}</p>
            <p style="margin-left:80px;">&nbsp;{{/each}}</p>
            <p style="margin-left:80px;"><br data-cke-filler="true"></p>
            <p style="margin-left:80px;"><span style="color:hsl(0,0%,30%);font-family:Arial, Helvetica, sans-serif;">Now it's your turn to execute the workflow. Please perform the necessary action as soon as possible so that the rest of the workflow can be executed.</span></p>
            <figure class="table ck-widget ck-widget_with-selection-handle" contenteditable="false">
              <div class="ck ck-widget__selection-handle">
                <svg class="ck ck-icon ck-reset_all-excluded ck-icon_inherit-color" viewBox="0 0 16 16">
                  <path d="M4 0v1H1v3H0V.5A.5.5 0 0 1 .5 0H4zm8 0h3.5a.5.5 0 0 1 .5.5V4h-1V1h-3V0zM4 16H.5a.5.5 0 0 1-.5-.5V12h1v3h3v1zm8 0v-1h3v-3h1v3.5a.5.5 0 0 1-.5.5H12z"></path>
                  <path fill-opacity=".256" d="M1 1h14v14H1z"></path>
                  <g class="ck-icon__selected-indicator">
                    <path d="M7 0h2v1H7V0zM0 7h1v2H0V7zm15 0h1v2h-1V7zm-8 8h2v1H7v-1z"></path>
                    <path fill-opacity=".254" d="M1 1h14v14H1z"></path>
                  </g>
                </svg>
              </div>
              <table>
                <tbody>
                  <tr>
                    <th class="ck-editor__editable ck-editor__nested-editable" role="textbox" contenteditable="true">
                      <p style="text-align:center;"><a href="https://depa-frontend.pages.dev/email-submission?submissionId={{submissionId}}&amp;stepId={{stepId}}&amp;userId={{userId}}&amp;isApproved=true"><span style="color:hsl( 120, 100%, 25% );">Approve&nbsp;</span></a><span style="color:hsl( 120, 100%, 25% );"> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;</span><a href="https://depa-frontend.pages.dev/email-submission?submissionId={{submissionId}}&amp;stepId={{stepId}}&amp;userId={{userId}}&amp;isApproved="><span style="color:hsl(0, 75%, 60%);">Reject&nbsp;</span></a></p>
                    </th>
                  </tr>
                </tbody>
              </table>
              <div class="ck ck-reset_all ck-widget__type-around">
                <div class="ck ck-widget__type-around__button ck-widget__type-around__button_before" title="Insert paragraph before block" aria-hidden="true">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 8">
                    <path d="M9.055.263v3.972h-6.77M1 4.216l2-2.038m-2 2 2 2.038"></path>
                  </svg>
                </div>
                <div class="ck ck-widget__type-around__button ck-widget__type-around__button_after" title="Insert paragraph after block" aria-hidden="true">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 8">
                    <path d="M9.055.263v3.972h-6.77M1 4.216l2-2.038m-2 2 2 2.038"></path>
                  </svg>
                </div>
                <div class="ck ck-widget__type-around__fake-caret"></div>
              </div>
            </figure>
            <p style="margin-left:80px;"><span style="color:hsl(0,0%,30%);font-family:Arial, Helvetica, sans-serif;">Regards, DEPA Group</span></p>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="ck ck-reset_all ck-widget__type-around">
      <div class="ck ck-widget__type-around__button ck-widget__type-around__button_before" title="Insert paragraph before block" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 8">
          <path d="M9.055.263v3.972h-6.77M1 4.216l2-2.038m-2 2 2 2.038"></path>
        </svg>
      </div>
      <div class="ck ck-widget__type-around__button ck-widget__type-around__button_after" title="Insert paragraph after block" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 8">
          <path d="M9.055.263v3.972h-6.77M1 4.216l2-2.038m-2 2 2 2.038"></path>
        </svg>
      </div>
      <div class="ck ck-widget__type-around__fake-caret"></div>
    </div>
  </figure>
</div>
  `;
  emailContentNotify: any = `
  <div class="ck ck-content ck-editor__editable ck-rounded-corners ck-editor__editable_inline ck-blurred" lang="en" dir="ltr" role="textbox" aria-label="Editor editing area: main" contenteditable="true">
  <h1 class="ck-placeholder" data-placeholder="Type your title"><br data-cke-filler="true"></h1>
  <figure class="image ck-widget ck-widget_with-resizer" contenteditable="false" data-placeholder="Type or paste your content here.">
    <img src="https://depa.com/images/logo.png">
    <div class="ck ck-reset_all ck-widget__type-around">
      <div class="ck ck-widget__type-around__button ck-widget__type-around__button_before" title="Insert paragraph before block" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 8">
          <path d="M9.055.263v3.972h-6.77M1 4.216l2-2.038m-2 2 2 2.038"></path>
        </svg>
      </div>
      <div class="ck ck-widget__type-around__button ck-widget__type-around__button_after" title="Insert paragraph after block" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 8">
          <path d="M9.055.263v3.972h-6.77M1 4.216l2-2.038m-2 2 2 2.038"></path>
        </svg>
      </div>
      <div class="ck ck-widget__type-around__fake-caret"></div>
    </div>
    <div class="ck ck-reset_all ck-widget__resizer ck-hidden">
      <div class="ck-widget__resizer__handle ck-widget__resizer__handle-top-left"></div>
      <div class="ck-widget__resizer__handle ck-widget__resizer__handle-top-right"></div>
      <div class="ck-widget__resizer__handle ck-widget__resizer__handle-bottom-right"></div>
      <div class="ck-widget__resizer__handle ck-widget__resizer__handle-bottom-left"></div>
      <div class="ck ck-size-view" style="display: none;"></div>
    </div>
  </figure>
  <figure class="table ck-widget ck-widget_with-selection-handle" contenteditable="false">
    <div class="ck ck-widget__selection-handle">
      <svg class="ck ck-icon ck-reset_all-excluded ck-icon_inherit-color" viewBox="0 0 16 16">
        <path d="M4 0v1H1v3H0V.5A.5.5 0 0 1 .5 0H4zm8 0h3.5a.5.5 0 0 1 .5.5V4h-1V1h-3V0zM4 16H.5a.5.5 0 0 1-.5-.5V12h1v3h3v1zm8 0v-1h3v-3h1v3.5a.5.5 0 0 1-.5.5H12z"></path>
        <path fill-opacity=".256" d="M1 1h14v14H1z"></path>
        <g class="ck-icon__selected-indicator">
          <path d="M7 0h2v1H7V0zM0 7h1v2H0V7zm15 0h1v2h-1V7zm-8 8h2v1H7v-1z"></path>
          <path fill-opacity=".254" d="M1 1h14v14H1z"></path>
        </g>
      </svg>
    </div>
    <table>
      <tbody>
        <tr>
          <td class="ck-editor__editable ck-editor__nested-editable" role="textbox" contenteditable="true">
            <h3 style="margin-left:80px;">Hello!</h3>
            <p style="margin-left:80px;"><br data-cke-filler="true"></p>
            <p style="margin-left:80px;">{{#each formsData}}</p>
            <p style="margin-left:120px;">{{formId.title}}</p>
            <p style="margin-left:160px;">{{@key}} : {{this}}</p>
            <p style="margin-left:160px;">{{@key}} : {{this}}</p>
            <p style="margin-left:80px;">&nbsp;{{/each}}</p>
            <p style="margin-left:80px;"><br data-cke-filler="true"></p>
            <p style="margin-left:80px;"><span style="color:hsl(0,0%,30%);font-family:Arial, Helvetica, sans-serif;">Now it's your turn to execute the workflow. Please perform the necessary action as soon as possible so that the rest of the workflow can be executed.</span></p>
            <p style="margin-left:80px;"><span style="color:hsl(0,0%,30%);font-family:Arial, Helvetica, sans-serif;">Regards, DEPA Group</span></p>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="ck ck-reset_all ck-widget__type-around">
      <div class="ck ck-widget__type-around__button ck-widget__type-around__button_before" title="Insert paragraph before block" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 8">
          <path d="M9.055.263v3.972h-6.77M1 4.216l2-2.038m-2 2 2 2.038"></path>
        </svg>
      </div>
      <div class="ck ck-widget__type-around__button ck-widget__type-around__button_after" title="Insert paragraph after block" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 8">
          <path d="M9.055.263v3.972h-6.77M1 4.216l2-2.038m-2 2 2 2.038"></path>
        </svg>
      </div>
      <div class="ck ck-widget__type-around__fake-caret"></div>
    </div>
  </figure>
</div>
  `;

  /**
   * Breadcrumb array to display
   */
  items: BreadCrumbs[] = [];
  tempItems = new EventEmitter<BreadCrumbs[]>();
  previousRoute: string;
  id: string;
  inheritSubmoduleData: BehaviorSubject<any> = new BehaviorSubject({})

  /**
   * Uses HttpClient as an override method that asserts that function it describes is in the parent or base class i.e http methods inside the Api Service
   * @param http Performs HTTP requests.
   */
  constructor(protected override http: HttpClient, private notif: NotificationsService) {
    super(http)
    this.excludeIdEmitter.subscribe(val => {
      this.id = val
    })
  }

  /**
   * Handles the dynamic creation of breadcrumbs when route changes
   * @param route Provides access to information about a route associated with a component that is loaded in an outlet.
   * @param routerLink The route path
   * @param breadcrumbs Array fo breadcrumbs
   * @returns {BreadCrumbs[]} An array of breadcrumbs
   */
  public createBreadcrumbs(route: ActivatedRoute, routerLink: string = '', breadcrumbs: BreadCrumbs[] = []) {
    const children: ActivatedRoute[] = route.children;
    if (children.length === 0) {
      return breadcrumbs;
    }
    for (const child of children) {
      const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
      if (routeURL !== '') {
        routerLink += `/${routeURL}`;
      }
      const caption = child.snapshot.data['breadcrumb']?.replace(/[_-]/g, ' ');
      if (['Dashboard', 'Add', 'Edit', 'Create', 'Categories', 'Companies', 'Users', 'Profile']?.some(val => caption?.includes(val))) {
        breadcrumbs.push({caption, routerLink});
      }
      this.createBreadcrumbs(child, routerLink, breadcrumbs);
    }
    return breadcrumbs
  }

  /**
   * Get method for fetching dashbaord page apps
   * @returns {Observable<ApiResponse>} Returns an observable array with category and corresponding module data
   */
  getDashboardApps(): Observable<ApiResponse<any>> {
    return this.get(`/dashboard`).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message || 'Failed to fetch data', 'Get dashboard apps', TuiNotification.Error)
        }
      }
    }))
  }

  // Validate Module Code

  validateModuleCode(codeValue: string, model: string, key?: string, typedVal?: string): Observable<ApiResponse<any>> {
    let params = {
      model: model,
      value: codeValue || typedVal,
      key: key ? key : undefined,
      excludeId: this.id ? this.id : undefined
    }
    if(!params.key) {
      delete params.key
    }
    if(!params.excludeId) {
      delete params.excludeId
    }
    return this.get(`/validate/unique`, params)
  }

  validateFormCode(codeValue: string): Observable<ApiResponse<any>> {
    let params = {key: codeValue}
    return this.get(`/forms/validate-key`, params)
  }

  getSubModuleByModule(moduleID: string): Observable<ApiResponse<any>> {
    return this.get(`/module/${moduleID}`).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        return res.data
      }
      else {
        if (![401, 403].includes(res.errors[0].code) || res.errors[0].code !== undefined) {
          return this.notif.displayNotification(res.errors[0]?.error?.message, 'Get submodules', TuiNotification.Error)
        }
      }
    }))
  }

  //Users

  getAllUsers(limit: number, page: number, name?: string, role?: string, sortBy?: string): Observable<ApiResponse<any>> {
    let params: any = {
      limit: limit,
      page: page+ 1,
      fullName: name ? name : ' '
    }
    if(name) {
      params = {
        limit: limit,
        fullName: name ? name : ' '
      }
    }
    return this.get(`/users`, params).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        return res.data?.results?.map((value: User) => {
          return {
            id: value?.id,
            name: value?.fullName,
            control: new FormControl<boolean>(false),
            roles: value?.roles
          }
        })
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message || 'Failed to fetch users', 'Get Users', TuiNotification.Error)
        }
      }
    }))
  }

  getAllUsersForListing(limit: number, page?: number, name?: string, role?: string, sortBy?: string): Observable<ApiResponse<any>> {
    let params: any = {
      limit: limit,
      page: page+ 1,
      fullName: name ? name : ' '
    }
    if(name) {
      params = {
        limit: limit,
        fullName: name ? name : ' '
      }
    }
    return this.get(`/users`, params).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message || 'Failed to fetch users', 'Get Users', TuiNotification.Error)
        }
      }
    }))
  }

  getAllAdminUsers(limit: number, page: number, name?: string, role?: string, sortBy?: string): Observable<ApiResponse<any>> {
    let params: any = {
      limit: limit,
      page: page+ 1,
      fullName: name ? name : ' '
    }
    if(name) {
      params = {
        limit: limit,
        fullName: name ? name : ' '
      }
    }
    return this.get(`/users/admins`, params).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        return res.data?.results?.map((value: User) => {
          return {
            id: value?.id,
            name: value?.fullName,
            control: new FormControl<boolean>(false)
          }
        })
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message || 'Failed to fetch users', 'Get Users', TuiNotification.Error)
        }
      }
    }))
  }

  getAdminUsers(limit: number, page?: number, name?: string, role?: string, sortBy?: string): Observable<ApiResponse<any>> {
    let params: any = {
      limit: limit,
      page: page+ 1,
      fullName: name ? name : ' '
    }
    if(name) {
      params = {
        limit: limit,
        fullName: name ? name : ' '
      }
    }
    return this.get(`/users/admins`, params).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message || 'Failed to fetch users', 'Get Users', TuiNotification.Error)
        }
      }
    }))
  }

  updateUser(id: string, payload: any): Observable<ApiResponse<any>> {
    return this.patch(`/users/${id}`, payload).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.notif.displayNotification('User updated successfully', 'Update User', TuiNotification.Success);
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message, 'Update User', TuiNotification.Error)
        }
      }
    }))
  }

  deleteUser(id: string): Observable<ApiResponse<any>> {
    return this.delete(`/users/${id}`).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.notif.displayNotification('User removed', 'Remove User', TuiNotification.Success);
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message, 'Delete User', TuiNotification.Error)
        }
      }
    }))
  }

  addNewUser(payload: any): Observable<ApiResponse<any>> {
    return this.post(`/users`, payload).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.notif.displayNotification('User created', 'Add User', TuiNotification.Success);
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message, 'Add User', TuiNotification.Error)
        }
      }
    }))
  }

  // Companies

  getAllCompanies(limit: number, page: number): Observable<ApiResponse<any>> {
    const params: any = {
      limit: limit,
      page: page+ 1
    }
    return this.get(`/companies`, params).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message ||'Failed to fetch data', 'Fetch companies', TuiNotification.Error);
        }
      }
    }))
  }

  addCompany(payload: any): Observable<ApiResponse<any>> {
    return this.post(`/companies`, payload).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.notif.displayNotification('New company added', 'Add company', TuiNotification.Success);
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message, 'Add company', TuiNotification.Error);
        }
      }
    }))
  }

  updateCompany(payload: any, companyId: string): Observable<ApiResponse<any>> {
    return this.patch(`/companies/${companyId}`, payload).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.notif.displayNotification('Company updated', 'Update Company', TuiNotification.Success);
        return res?.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code))
        return this.notif.displayNotification(res.errors[0]?.error?.message, 'Update Company', TuiNotification.Error)
      }
    }))
  }

  deleteCompany(companyId: string): Observable<ApiResponse<any>> {
    return this.delete(`/companies/${companyId}`).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.notif.displayNotification('Company deleted', 'Delete Company', TuiNotification.Success);
        return res?.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code))
        return this.notif.displayNotification(res.errors[0]?.error?.message, 'Delete Category', TuiNotification.Error)
      }
    }))
  }

  // Modules

  createModule(payload: Module): Observable<ApiResponse<any>> {
    this.creatingModule.next(true);
    return this.post(`/modules`, payload).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.creatingModule.next(false)
        return res.data
      }
      else {
        this.creatingModule.next(false);
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message, 'Create Module', TuiNotification.Error)
        }
      }
    }))
  }

  deleteModule(moduleID: string): Observable<ApiResponse<any>> {
    return this.delete(`/modules/${moduleID}`).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.notif.displayNotification('Module removed successfully', 'Delete Module', TuiNotification.Success);
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message ||'Failed to delete module', 'Delete Module', TuiNotification.Error);
        }
      }
    }))
  }

  getModuleByID(moduleID: string): Observable<ApiResponse<any>> {
    return this.get(`/modules/${moduleID}`).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        return res.data;
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message ||'Failed to fetch module', 'Get Module', TuiNotification.Error);
        }
      }
    }))
  }

  getAllModules(): Observable<ApiResponse<any>> {
    // const params: any = {
    //   limit: limit,
    //   page: page,
    //   ...queryParams
    // }
    return this.get(`/modules`).pipe(map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message, 'Get Modules', TuiNotification.Error);
        }
      }
    }))
  }

  getModuleByIDForEditModule(moduleID: string): Observable<ApiResponse<any>> {
    return this.get(`/modules/${moduleID}`).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.moduleEditData.next(res.data)
        return res.data;
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message ||'Failed to fetch module', 'Get Module', TuiNotification.Error);
        }
      }
    }))
  }

  editModule(moduleID: string, payload: any): Observable<ApiResponse<any>> {
    this.creatingModule.next(true);
    return this.patch(`/modules/${moduleID}`, payload).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.creatingModule.next(false)
        return res.data
      }
      else {
        this.creatingModule.next(false)
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message, 'Create Module', TuiNotification.Error)
        }
      }
    }))
  }

  getWorkflowFromModule(moduleID: string): Observable<ApiResponse<any>> {
    return this.get(`/modules/${moduleID}`).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        // this.moduleEditData.next(res.data);
        const response = res.data?.workFlowId?.stepIds?.map(data => {
          return {
            approverIds: data?.approverIds?.map(ids => {
              return {
                name: ids?.fullName,
                id: ids?.id,
                control: new FormControl<boolean>(true)
              }
            }),
            condition: data?.condition,
            emailNotifyTo: data?.emailNotifyToId?.notifyUsers
          }
        });
        return response;
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message ||'Failed to fetch module', 'Get Module', TuiNotification.Error);
        }
      }
    }))
  }

  getWorkflowFromSubModule(moduleID: string): Observable<ApiResponse<any>> {
    return this.get(`/subModules/${moduleID}`).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.inheritSubmoduleData.next(res.data);
        const response = res.data?.workFlowId?.stepIds?.map(data => {
          return {
            approverIds: data?.approverIds?.map(ids => {
              return {
                name: ids?.fullName,
                id: ids?.id,
                control: new FormControl<boolean>(true)
              }
            }),
            condition: data?.condition,
            emailNotifyTo: data?.emailNotifyToId?.notifyUsers
          }
        });
        return Object.assign({response, categoryId: res.data?.categoryId?.id});
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message ||'Failed to fetch module', 'Get Module', TuiNotification.Error);
        }
      }
    }))
  }

  createSubModule(payload: any): Observable<ApiResponse<any>> {
    this.creatingModule.next(true);
    return this.post(`/subModules`, payload).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.creatingModule.next(false);
        this.notif.displayNotification('Module created successfully', 'Create Module', TuiNotification.Success);
        return res.data
      }
      else {
        this.creatingModule.next(false);
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message ||'Failed to create submodule', 'Create Module', TuiNotification.Error);
        }
      }
    }))
  }

  deleteSubModule(id: string): Observable<ApiResponse<any>> {
    return this.delete(`/subModules/${id}`).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.notif.displayNotification('App removed successfully', 'Delete App', TuiNotification.Success);
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message ||'Failed to remove app', 'Delete App', TuiNotification.Error);
        }
      }
    }))
  }

  // needed for edit Submodule page
  getSubModuleByID(submodID: string, extractDefaults?: boolean): Observable<ApiResponse<any>> {
    let params: any = {
      extractDefaults: extractDefaults
    }
    if(!extractDefaults) {
      delete params.extractDefaults
    }
    return this.get(`/subModules/${submodID}`, params).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message, 'Fetch Submodule', TuiNotification.Error);
        }
      }
    }))
  }

  getModulesBySlugName(slugName: string): Observable<ApiResponse<any>> {
    return this.get(`/modules/slug/${slugName}`).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message, 'Get Module by Slug Name', TuiNotification.Error)
        }
      }
    }))
  }

  getSubModuleBySlugName(slugName: string): Observable<ApiResponse<any>> {
    return this.get(`/subModules/slug/${slugName}`).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message, 'Get submodule', TuiNotification.Error)
        }
      }
    }))
  }

  // needed for showing submodule list by module name on submodules listing page
  getSubModuleByModuleSlug(moduleSlug: string, limit: any, page: any, queryParams?: any): Observable<ApiResponse<any>> {
    const params: any = {
      limit: limit,
      page: page,
      ...queryParams
    }

    if(queryParams?.search) {
      delete params?.page
    }
    return this.get(`/module/slug/${moduleSlug}`, params).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        const hierarchy = res.data?.navHierarchy?.map(val => {
          return {
            caption: val?.title,
            code: val?.code,
            routerLink: val?.id
          }
        })
        setItem(StorageItem.navHierarchy, hierarchy)
        this.tempItems.emit(hierarchy);
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message, 'Get submodules', TuiNotification.Error)
        }
      }
    }))
  }

  updateSubModule(id: string, payload: any): Observable<ApiResponse<any>> {
    return this.patch(`/subModules/${id}`, payload).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.notif.displayNotification('Submodule updated', 'Update submodule', TuiNotification.Success)
        return res.data
      }
      else {
        this.notif.displayNotification(res.errors[0]?.error?.message, 'Update submodule', TuiNotification.Error)
      }
    }))
  }

  //categories
  getAllCategories(limit: number): Observable<ApiResponse<any>> {
    const params: any = {
      limit: limit
    }
    return this.get(`/categories`, params).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message, 'Get categories', TuiNotification.Error)
        }
      }
    }))
  }

  addCategory(category: {name: string}): Observable<ApiResponse<any>> {
    return this.post('/categories', category).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message, 'Add new category', TuiNotification.Error)
        }
      }
    }))
  }

  editCategory(category: {name: string}, id: string): Observable<ApiResponse<any>> {
    return this.patch(`/categories/${id}`, category).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message, 'Edit category', TuiNotification.Error)
        }
      }
    }))
  }

  deleteCategory(id: string): Observable<ApiResponse<any>> {
    return this.delete(`/categories/${id}`).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message, 'Edit category', TuiNotification.Error)
        }
      }
    }))
  }
}
