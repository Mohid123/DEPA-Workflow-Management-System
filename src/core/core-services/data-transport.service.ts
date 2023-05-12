import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Defines the state of the Dialog
 * @enum Defines the state of the Dialog from DEFAULT, DISCARD and DRAFT
 */
export enum DialogState {
  DEFAULT = 'default',
  DISCARD = 'discard',
  DRAFT = 'draft'
}

/**
 * Injectable for client side transport of data and state management between different pages
 */
@Injectable({
  providedIn: 'root'
})
export class DataTransportService {

  /**
   * @ignore
   */
  public formBuilderData: BehaviorSubject<any> = new BehaviorSubject([
    {title: '', key: '', display: '', components: []}
  ]);

  /**
   * @ignore
   */
  public subModuleDraft: BehaviorSubject<any> = new BehaviorSubject({});

  moduleID = new BehaviorSubject<string>('');
  
  subModuleID = new BehaviorSubject<string>('');

  formEditId = new BehaviorSubject<string>('');

  /**
   * @ignore
   */
  public dialogState = new EventEmitter<DialogState>();

  /**
   * @ignore
   */
  public isFormEdit = new BehaviorSubject(false);

  /**
   * @ignore
   */
  public sendFormDataForEdit: BehaviorSubject<any> = new BehaviorSubject({title: '', key: '', display: '', components: []})

  /**
   * Data transport constructor definition
   */
  constructor() { }

  /**
   * Handles the transport of data from the form builder
   * @param {any} data Includes an Object with the form title and the components array
   */
  sendFormBuilderData(data: any) {
    this.formBuilderData.next(data);
  }

  /**
   * Saves the state of the submodule when user moves to and from the form builder page
   * @param data Includes the unsaved submodule data
   */
  saveDraftLocally(data: any) {
    this.subModuleDraft.next(data);
  }
  
}
