import { Component, ViewChild, EventEmitter, ElementRef, HostListener } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { FormioRefreshValue } from '@formio/angular';
import { TuiNotification } from '@taiga-ui/core';
import { DataTransportService } from 'src/core/core-services/data-transport.service';
import { NotificationsService } from 'src/core/core-services/notifications.service';

@Component({
  selector: 'app-form-builder',
  templateUrl: './form-builder.component.html',
  styleUrls: ['./form-builder.component.scss']
})
export class FormBuilderComponent {
  @ViewChild('json', {static: true}) jsonElement?: ElementRef;
  @ViewChild('code', {static: true}) codeElement?: ElementRef;
  public form: {formTitle: string , components: []};
  public refreshForm: EventEmitter<FormioRefreshValue> = new EventEmitter();
  activeIndex: number = 0;
  formValue: any;
  editMode: boolean = false;
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

  formTitleControl = new FormControl({value: '', disabled: this.editMode});

  constructor(
    private transportService: DataTransportService,
    private notif: NotificationsService,
    private router: Router
  ) {
    this.editMode = this.transportService.isFormEdit.value;
    if(this.editMode === true) {
      this.form = this.transportService.sendFormDataForEdit.value;
      this.formTitleControl.setValue(this.transportService.sendFormDataForEdit.value.formTitle);
      this.formTitleControl.disable();
    }
    else {
      this.form = {formTitle: this.formTitleControl?.value, components: []};
    }
  }

  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    event.preventDefault();
    event.returnValue = false;
  }

  onChange(event: any) {
    this.refreshForm.emit({
      property: 'form',
      value: event.form
    });
    this.formValue = event.form;
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
    if(!this.formTitleControl?.value || this.formTitleControl?.value == '') {
      return this.notif.displayNotification('Please provide a title for your form', 'Create Form', TuiNotification.Warning)
    }
    if(this.form?.components?.length == 0) {
      return this.notif.displayNotification('You have not created a form!', 'Create Form', TuiNotification.Warning)
    }
    this.form.formTitle = this.formTitleControl?.value;
    if(this.editMode == false) {
      if(this.transportService.formBuilderData.value[0].components?.length > 0) {
        const data = [...this.transportService.formBuilderData.value, this.form];
        this.transportService.sendFormBuilderData(data);
        this.router.navigate(['/appListing/add-submodule']);
      }
      else {
        this.transportService.sendFormBuilderData([this.form]);
        this.router.navigate(['/appListing/add-submodule']);
      }
    }
    else {
      const data = this.transportService.formBuilderData.value?.map(val => {
        if(val.formTitle == this.form?.formTitle) {
          val = this.form
        }
        return val
      });
      this.transportService.sendFormBuilderData(data);
      this.router.navigate(['/appListing/add-submodule']);
    }
  }

  cancelFormData() {
    this.transportService.sendFormBuilderData([{formTitle: '', components: []}]);
    this.router.navigate(['/appListing/add-submodule']);
  }

}
