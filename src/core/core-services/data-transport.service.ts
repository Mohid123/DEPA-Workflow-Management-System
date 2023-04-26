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

  public formBuilderData: BehaviorSubject<any> = new BehaviorSubject([
    {formTitle: '', components: []}
  ]);
  public subModuleDraft: BehaviorSubject<any> = new BehaviorSubject({});
  public dialogState = new EventEmitter<DialogState>();
  public isFormEdit = new BehaviorSubject(false);
  public sendFormDataForEdit: BehaviorSubject<any> = new BehaviorSubject({formTitle: '', components: []})

  constructor() { }

  sendFormBuilderData(data: any) {
    this.formBuilderData.next(data);
  }

  saveDraftLocally(data: any) {
    this.subModuleDraft.next(data);
  }

  
}
