import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { TuiNotification } from '@taiga-ui/core';
import { BehaviorSubject, Observable, Subject, map, shareReplay, tap } from 'rxjs';
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

  /**
   * Breadcrumb array to display
   */
  items: BreadCrumbs[] = [];

  /**
   * Uses HttpClient as an override method that asserts that function it describes is in the parent or base class i.e http methods inside the Api Service
   * @param http Performs HTTP requests.
   */
  constructor(protected override http: HttpClient, private notif: NotificationsService) {
    super(http)
  }

  /**
   * Handles the dynamic creation of breadcrumbs when route changes
   * @param route Provides access to information about a route associated with a component that is loaded in an outlet.
   * @param routerLink The route path
   * @param breadcrumbs Array fo breadcrumbs
   * @returns {BreadCrumbs[]} An array of breadcrumbs
   */
  public createBreadcrumbs(route: ActivatedRouteSnapshot, parentUrl: string[], breadcrumbs: BreadCrumbs[] = []) {
    if (route) { 
      // Construct the route URL 
      const routeUrl = parentUrl.concat(route.url.map(url => url.path)); 
 
      // Add an element for the current route part 
      if (route.data['breadcrumb']) { 
        const breadcrumb = { 
          caption: this.getLabel(route.data), 
          routerLink: '/' + routeUrl.join('/') 
        }; 
        breadcrumbs.push(breadcrumb); 
      } 
 
      // Add another element for the next route part 
      this.createBreadcrumbs(route.firstChild, routeUrl, breadcrumbs); 
    } 
  }

  private getLabel(data: any) { 
    // The breadcrumb can be defined as a static string or as a function to construct the breadcrumb element out of the route data 
    return typeof data.breadcrumb === 'function' ? data.breadcrumb(data) : data.breadcrumb; 
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
        return this.notif.displayNotification(res.errors[0]?.error?.message || 'Failed to fetch data', 'Get dashboard apps', TuiNotification.Error)
      }
    }))
  }

  getSubModuleByModule(moduleID: string): Observable<ApiResponse<any>> {
    return this.get(`/module/${moduleID}`).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        return res.data
      }
      else {
        return this.notif.displayNotification(res.errors[0]?.error?.message, 'Get submodules', TuiNotification.Error)
      }
    }))
  }

  getAllUsers(limit: number, page: number, name?: string, role?: string, sortBy?: string): Observable<ApiResponse<any>> {
    const params: any = {
      limit: limit,
      page: page,
      name: name ?? undefined
    }
    return this.get(`/users`, params).pipe(shareReplay(), map((res: ApiResponse<any>) => {
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
        return this.notif.displayNotification(res.errors[0]?.error?.message || 'Failed to fetch users', 'Get Users', TuiNotification.Error)
      }
    }))
  }

  getAllCategories(): Observable<ApiResponse<any>> {
    return this.get(`/categories`)
    .pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        const response = res.data?.results?.map((data: any) => {
          return {
            id: data?.id,
            name: data?.name
          }
        });
        return response
      }
      else {
        return this.notif.displayNotification(res.errors[0]?.error?.message || 'Failed to fetch categories', 'Get categories', TuiNotification.Error)
      }
    }))
  }

  createModule(payload: Module): Observable<ApiResponse<any>> {
    this.creatingModule.next(true);
    return this.post(`/modules`, payload).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.creatingModule.next(false)
        return res.data
      }
      else {
        this.creatingModule.next(false)
        return this.notif.displayNotification(res.errors[0]?.error?.message, 'Create Module', TuiNotification.Error)
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
        return this.notif.displayNotification(res.errors[0]?.error?.message ||'Failed to delete module', 'Delete Module', TuiNotification.Error);
      }
    }))
  }

  getModuleByID(moduleID: string): Observable<ApiResponse<any>> {
    return this.get(`/modules/${moduleID}`).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.moduleEditData.next(res.data)
        return res.data;
      }
      else {
        return this.notif.displayNotification(res.errors[0]?.error?.message ||'Failed to fetch module', 'Get Module', TuiNotification.Error);
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
        return this.notif.displayNotification(res.errors[0]?.error?.message, 'Create Module', TuiNotification.Error)
      }
    }))
  }

  getWorkflowFromModule(moduleID: string): Observable<ApiResponse<any>> {
    return this.get(`/modules/${moduleID}`).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        // this.moduleEditData.next(res.data);
        const response = res.data?.workFlowId?.stepIds?.map(data => {
          return {
            approverIds: data?.approverIds?.map(ids => ids.id),
            condition: data?.condition
          }
        });
        return response;
      }
      else {
        return this.notif.displayNotification(res.errors[0]?.error?.message ||'Failed to fetch module', 'Get Module', TuiNotification.Error);
      }
    }))
  }

  createSubModule(payload: any): Observable<ApiResponse<any>> {
    this.creatingModule.next(true);
    return this.post(`/subModules`, payload).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.creatingModule.next(false);
        this.notif.displayNotification('Submodule created successfully', 'Create SubModule', TuiNotification.Success);
        return res.data
      }
      else {
        this.creatingModule.next(false)
        return this.notif.displayNotification(res.errors[0]?.error?.message ||'Failed to create submodule', 'Create SubModule', TuiNotification.Error);
      }
    }))
  }

  getAllCompanies(): Observable<ApiResponse<any>> {
    return this.get(`/companies`).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        return res.data
      }
      else {
        return this.notif.displayNotification(res.errors[0]?.error?.message ||'Failed to fetch data', 'Fetch companies', TuiNotification.Error);
      }
    }))
  }

  deleteSubModule(id: string): Observable<ApiResponse<any>> {
    return this.delete(`/subModules/${id}`).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.notif.displayNotification('Submodule removed successfully', 'Delete SubModule', TuiNotification.Success);
        return res.data
      }
      else {
        return this.notif.displayNotification(res.errors[0]?.error?.message ||'Failed to remove submodule', 'Delete SubModule', TuiNotification.Error);
      }
    }))
  }

  getSubModuleByID(submodID: string): Observable<ApiResponse<any>> {
    return this.get(`/subModules/${submodID}`).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        return res.data
      }
      else {
        return this.notif.displayNotification(res.errors[0]?.error?.message, 'Fetch Submodule', TuiNotification.Error);
      }
    }))
  }
}
