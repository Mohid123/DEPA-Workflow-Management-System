import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export enum DialogState {
  DEFAULT = 'default',
  DISCARD = 'discard',
  DRAFT = 'draft'
}
@Injectable({
  providedIn: 'root'
})
export class DataTransportService {

  public formBuilderData: BehaviorSubject<any> = new BehaviorSubject({components: []});
  public subModuleDraft: BehaviorSubject<any> = new BehaviorSubject({});
  public dialogState = new EventEmitter<DialogState>()

  constructor() { }

  sendFormBuilderData(data: any) {
    this.formBuilderData.next(data);
  }

  saveDraftLocally(data: any) {
    this.subModuleDraft.next(data)
  }

  
}
