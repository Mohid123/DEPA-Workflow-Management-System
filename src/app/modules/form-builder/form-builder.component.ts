import { Component, ViewChild, EventEmitter, ElementRef } from '@angular/core';
import { FormioRefreshValue } from '@formio/angular';

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
  constructor() {
    this.form = {components: []};
  }

  onChange(event: any) {
    this.jsonElement!.nativeElement.innerHTML = '';
    this.jsonElement?.nativeElement.appendChild(document.createTextNode(JSON.stringify(event.form, null, 4)));
    this.refreshForm.emit({
      property: 'form',
      value: event.form
    });
  }

}
