import { Component, ViewChild, EventEmitter, ElementRef } from '@angular/core';
import { FormioRefreshValue } from '@formio/angular';
import { DataTransportService } from 'src/core/core-services/data-transport.service';

@Component({
  selector: 'app-form-builder',
  templateUrl: './form-builder.component.html',
  styleUrls: ['./form-builder.component.scss']
})
export class FormBuilderComponent {
  @ViewChild('json', {static: true}) jsonElement?: ElementRef;
  @ViewChild('code', {static: true}) codeElement?: ElementRef;
  public form: Object;
  public refreshForm: EventEmitter<FormioRefreshValue> = new EventEmitter();
  activeIndex: number = 0;
  formValue: any;
  readonly items = [
    {
      text: 'Form Builder',
      icon: 'fa fa-file-text-o fa-lg',
    },
    {
      text: 'Preview',
      icon: 'fa fa-eye fa-lg',
    },
    {
      text: 'JSON view',
      icon: 'fa fa-file-code-o fa-lg',
    }
  ];

  constructor(private transportService: DataTransportService) {
    this.form = this.transportService.formBuilderData.value || {components: []};
  }

  onChange(event: any) {
    this.refreshForm.emit({
      property: 'form',
      value: event.form
    });
    this.formValue = event.form
  }

  onJsonView() {
    setTimeout(() => {
      const jsonElement = document.getElementById('json_code');
      if(jsonElement)
        jsonElement.innerHTML = '';
        jsonElement?.appendChild(document.createTextNode(JSON.stringify(this.formValue, null, 4)));
    }, 500)
  }

  submitFormData() {
    this.transportService.sendFormBuilderData(this.form);
  }

  cancelFormData() {
    this.transportService.sendFormBuilderData({components: []});
  }

}
