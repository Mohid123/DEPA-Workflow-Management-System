import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TuiNotification } from '@taiga-ui/core';
import { BehaviorSubject, Observable, Subject, map, shareReplay } from 'rxjs';
import { ApiService } from 'src/core/core-services/api.service';
import { NotificationsService } from 'src/core/core-services/notifications.service';
import { ApiResponse } from 'src/core/models/api-response.model';
import { Module } from 'src/core/models/module.model';
import { User } from 'src/core/models/user.model';

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
      const caption = child.snapshot.data['breadcrumb']?.replace(/[_-]/, ' ')
      if (caption) {
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

  // Categories

  getAllCategories(limit: number, page: number): Observable<ApiResponse<any>> {
    const params: any = {
      limit: limit,
      page: page+ 1
    }
    return this.get(`/categories`)
    .pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        const results = res.data?.results?.map((data: any) => {
          return {
            id: data?.id,
            name: data?.name
          }
        });
        return Object.assign(res?.data, {results: results})
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message || 'Failed to fetch categories', 'Get categories', TuiNotification.Error)
        }
      }
    }))
  }

  postNewCategory(payload: {name: string}): Observable<ApiResponse<any>> {
    return this.post(`/categories`, payload).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.notif.displayNotification('Category created successfully', 'Create Category', TuiNotification.Success);
        return res?.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code))
        return this.notif.displayNotification(res.errors[0]?.error?.message, 'Create Category', TuiNotification.Error)
      }
    }))
  }

  updateCategory(payload: any, categoryId: string): Observable<ApiResponse<any>> {
    return this.patch(`/categories/${categoryId}`, payload).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.notif.displayNotification('Category updated', 'Update Category', TuiNotification.Success);
        return res?.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code))
        return this.notif.displayNotification(res.errors[0]?.error?.message, 'Update Category', TuiNotification.Error)
      }
    }))
  }

  deleteCategory(categoryId: string): Observable<ApiResponse<any>> {
    return this.delete(`/categories/${categoryId}`).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.notif.displayNotification('Category deleted', 'Delete Category', TuiNotification.Success);
        return res?.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code))
        return this.notif.displayNotification(res.errors[0]?.error?.message, 'Delete Category', TuiNotification.Error)
      }
    }))
  }

  // Companies

  getAllCompanies(limit: number, page: number): Observable<ApiResponse<any>> {
    const params: any = {
      limit: limit,
      page: page+ 1
    }
    return this.get(`/companies`).pipe(shareReplay(), map((res: ApiResponse<any>) => {
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

  createSubModule(payload: any): Observable<ApiResponse<any>> {
    this.creatingModule.next(true);
    return this.post(`/subModules`, payload).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.creatingModule.next(false);
        this.notif.displayNotification('Submodule created successfully', 'Create SubModule', TuiNotification.Success);
        return res.data
      }
      else {
        this.creatingModule.next(false);
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message ||'Failed to create submodule', 'Create SubModule', TuiNotification.Error);
        }
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
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message ||'Failed to remove submodule', 'Delete SubModule', TuiNotification.Error);
        }
      }
    }))
  }

  // needed for edit Submodule page
  getSubModuleByID(submodID: string): Observable<ApiResponse<any>> {
    return this.get(`/subModules/${submodID}`).pipe(shareReplay(), map((res: ApiResponse<any>) => {
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
}
