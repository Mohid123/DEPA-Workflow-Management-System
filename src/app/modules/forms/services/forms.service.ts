import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TuiNotification } from '@taiga-ui/core';
import { Observable, map, shareReplay } from 'rxjs';
import { ApiService } from 'src/core/core-services/api.service';
import { NotificationsService } from 'src/core/core-services/notifications.service';
import { ApiResponse } from 'src/core/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class FormsService extends ApiService<any> {

  constructor(protected override http: HttpClient, private notif: NotificationsService) {
    super(http)
  }

  /**
   * Method for fetching a form by it's id
   * @param formID form id string
   * @returns Observable of Form Object
   */
  getFormById(formID: string): Observable<ApiResponse<any>> {
    return this.get(`/forms/${formID}`).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        return res.data
      }
      else {
        return this.notif.displayNotification(res.errors[0]?.error?.message, 'Fetch Form', TuiNotification.Error)
      }
    }))
  }

  /**
   * Method for fetching form by it's key
   * @param key Form key/code/slug string
   * @returns Observable form object
   */
  getFormByKey(key: string): Observable<ApiResponse<any>> {
    return this.get(`/forms/slug/${key}`).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        return res.data
      }
      else {
        return this.notif.displayNotification(res.errors[0]?.error?.message, 'Fetch Form', TuiNotification.Error)
      }
    }))
  }

  /**
   * Method for updating form
   * @param id form id string
   * @param payload form data object
   * @returns Observable of updated form object
   */
  updateForm(id: string, payload: any): Observable<ApiResponse<any>> {
    return this.patch(`/forms/${id}`, payload).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.notif.displayNotification('Form data updated', 'Edit Form', TuiNotification.Success);
        return res.data
      }
      else {
        return this.notif.displayNotification(res.errors[0]?.error?.message, 'Edit Form', TuiNotification.Error)
      }
    }))
  }

  /**
   * Method for creating new form
   * @param payload Form object
   * @returns Observable Form object
   */
  createForm(payload: any): Observable<ApiResponse<any>> {
    return this.post(`/forms`, payload).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.notif.displayNotification('Form created successfully', 'Create Form', TuiNotification.Success);
        return res.data
      }
      else {
        return this.notif.displayNotification(res.errors[0]?.error?.message, 'Create Form', TuiNotification.Error)
      }
    }))
  }

  /**
   * Method for deleting form
   * @param id form string
   * @returns Observable of form's deleted status
   */
  deleteForm(id: string): Observable<ApiResponse<any>> {
    return this.delete(`/forms/${id}`).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.notif.displayNotification('Form removed', 'Delete Form', TuiNotification.Success);
        return res.data
      }
      else {
        return this.notif.displayNotification(res.errors[0]?.error?.message, 'Delete Form', TuiNotification.Error)
      }
    }))
  }
}
