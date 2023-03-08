import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { ResponseAddMedia } from '../models/media-upload.model';
import { ApiService } from './api.service'
import { HttpClient } from '@angular/common/http';

type uploadMedia = ResponseAddMedia | any;

@Injectable({
  providedIn: 'root'
})

export class MediaUploadService extends ApiService<uploadMedia> {

  constructor(protected override http: HttpClient) {
    super(http);
  }

  uploadMedia(folderName: string, file:any): Observable<ApiResponse<uploadMedia>> {
    const formData: FormData = new FormData();
    formData.append('file', file);
    return this.postMedia(`/api/media-upload/mediaFiles/${folderName}`, formData);
  }
}
