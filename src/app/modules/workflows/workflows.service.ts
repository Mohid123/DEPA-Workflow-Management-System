import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { TuiNotification } from '@taiga-ui/core';
import { Observable, map, shareReplay } from 'rxjs';
import { ApiService } from 'src/core/core-services/api.service';
import { NotificationsService } from 'src/core/core-services/notifications.service';
import { ApiResponse } from 'src/core/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class WorkflowsService extends ApiService<any> {

  actionComplete = new EventEmitter();

  constructor(protected override http: HttpClient, private notif: NotificationsService) {
    super(http)
  }

  /**
   * Method for fetching Submission by id
   * @param id string
   * @returns Observable of Submission with its' workflow and form data
   */
  getWorkflowSubmission(id: string): Observable<ApiResponse<any>> {
    return this.get(`/submissions/${id}`).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          this.notif.displayNotification('Failed to fetch workflow', 'Get Submodule workflow', TuiNotification.Error)
        }
      }
    }))
  }

  /**
   * Method for fetching submission from its' app
   * @param id 
   * @param limit 
   * @param page 
   * @param submissionStatus 
   * @param sortBy 
   * @param sortByFormat 
   * @param payload 
   * @returns Observable of Submission Object
   */
  getSubmissionFromSubModule(id: string, limit: any, page: any, submissionStatus?: number, sortBy?: string, sortByFormat?: string, payload?: any): Observable<ApiResponse<any>> {
    const params = {
      subModuleId: id,
      limit: limit,
      page: page,
      sortKey: sortBy ? sortBy : undefined,
      sortBy: sortByFormat ? sortByFormat : undefined,
      submissionStatus: submissionStatus ? submissionStatus : undefined
    }
    if(params.submissionStatus == undefined) {
      delete params.submissionStatus
    }
    if(params.sortKey == undefined) {
      delete params.sortKey
    }
    if(params.sortBy == undefined) {
      delete params.sortBy
    }
    return this.post(`/submissions`, payload || {}, params).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message || 'Failed to fetch submissions', 'Get Submissions', TuiNotification.Error)
        }
      }
    }))
  }

  /**
   * Method for updating submission by email
   * @param id 
   * @param payload 
   * @returns 
   */
  updateSubmissionByEmail(id: string, payload: any): Observable<ApiResponse<any>> {
    return this.patch(`/submissions/email/${id}`, payload).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.notif.displayNotification('Action complete. Submission updated', 'Update Submission', TuiNotification.Success)
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message, 'Update Submission', TuiNotification.Error)
        }
      }
    })) 
  }

  /**
   * Method for updating submission and it's workflow
   * @param id 
   * @param payload 
   * @returns 
   */
  updateSubmissionWorkflow(id: string, payload: any): Observable<ApiResponse<any>> {
    return this.patch(`/submissions/${id}`, payload).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.notif.displayNotification('Action complete. Submission updated', 'Update Submission', TuiNotification.Success)
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message, 'Update Submission', TuiNotification.Error)
        }
      }
    }))
  }

  /**
   * Method for creating a new Submission on a collection of forms
   * @param payload Submission data object from form
   * @returns 
   */
  addNewSubmission(payload: any): Observable<ApiResponse<any>> {
    return this.post(`/submissions/create`, payload).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.notif.displayNotification('Submission created successfully', 'Create Submission', TuiNotification.Success)
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message, 'Create Submission', TuiNotification.Error)
        }
      }
    }))
  }

  /**
   * Method for updating the forms data object of a submission and all its' submissions
   * @param payload Object
   * @param id string
   * @returns 
   */
  updateFormsData(payload: any, id: string): Observable<ApiResponse<any>> {
    return this.patch(`/formsData/${id}`, payload).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.notif.displayNotification('Form data updated successfully', 'Update Forms data', TuiNotification.Success)
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message, 'Update Forms Data', TuiNotification.Error)
        }
      }
    }))
  }

  /**
   * Method for updating multiple forms data objects for multiple forms simultaneously
   * @param payload Array of objects
   * @returns 
   */
  updateMultipleFormsData(payload: any): Observable<ApiResponse<any>> {
    return this.patch(`/formsData/multiple`, payload).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.notif.displayNotification('Form data updated successfully', 'Update Forms data', TuiNotification.Success)
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message, 'Update Forms Data', TuiNotification.Error)
        }
      }
    }))
  }

  /**
   * Method for updating a specific workflow step
   * @param data Workflow data object
   * @param id string
   * @returns 
   */
  updateWorkflowStep(data: any, id: string): Observable<ApiResponse<any>> {
    return this.patch(`/submissions/workflow/${id}`, data).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.notif.displayNotification(res?.data?.message, 'Update Workflow Step', TuiNotification.Success)
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message, 'Update Workflow Step', TuiNotification.Error)
        }
      }
    }))
  }
}
