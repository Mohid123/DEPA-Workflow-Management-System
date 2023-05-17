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
export class WorkflowsService extends ApiService<any> {

  constructor(protected override http: HttpClient, private notif: NotificationsService) {
    super(http)
  }

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

  getSubmissionFromSubModule(id: string): Observable<ApiResponse<any>> {
    const params = {
      subModuleId: id
    }
    return this.get(`/submissions`, params).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification('Failed to fetch workflow', 'Get Submodule workflow', TuiNotification.Error)
        }
      }
    }))
  }

  updateSubmissionWorkflow(id: string, payload: any): Observable<ApiResponse<any>> {
    return this.patch(`/submissions/${id}`, payload).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.notif.displayNotification('Descision made, Workflow updated.', 'Update Submission', TuiNotification.Success)
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message, 'Update Submission', TuiNotification.Error)
        }
      }
    }))
  }

  addNewSubmission(payload: any): Observable<ApiResponse<any>> {
    return this.post(`/submissions`, payload).pipe(shareReplay(), map((res: ApiResponse<any>) => {
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
}
