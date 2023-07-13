import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { ApiService } from './api.service'
import { HttpClient } from '@angular/common/http';
import { NotificationsService } from './notifications.service';
import { TuiNotification } from '@taiga-ui/core';

type uploadMedia = any;

@Injectable({
  providedIn: 'root'
})

export class MediaUploadService extends ApiService<uploadMedia> {

  constructor(protected override http: HttpClient, private notif: NotificationsService) {
    super(http);
  }

  uploadMedia(file:any): Observable<ApiResponse<uploadMedia>> {
    const formData: FormData = new FormData();
    formData.append('file', file);
    return this.postMedia(`/upload`, formData).pipe(tap((res: ApiResponse<any>) => {
      if(res.hasErrors()) {
        return this.notif.displayNotification(res.errors[0]?.error?.message, 'Image Upload', TuiNotification.Error)
      }
    }));
  }
}