import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataTransportService {

  public formBuilderData: BehaviorSubject<any> = new BehaviorSubject({components: []})

  constructor() { }

  sendFormBuilderData(data: any) {
    this.formBuilderData.next(data);
  }
}
