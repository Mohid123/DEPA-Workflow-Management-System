import { Component, ViewChild, EventEmitter, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FormioRefreshValue } from '@formio/angular';
import { TuiNotification } from '@taiga-ui/core';
import { DataTransportService } from 'src/core/core-services/data-transport.service';
import { NotificationsService } from 'src/core/core-services/notifications.service';
import { Subject, takeUntil } from 'rxjs';
import { FormsService } from '../../services/forms.service';
import { Location } from '@angular/common';;

@Component({
  templateUrl: './form-builder.component.html',
  styleUrls: ['./form-builder.component.scss']
})
export class FormBuilderComponent{
  @ViewChild('json', {static: true}) jsonElement?: ElementRef;
  @ViewChild('code', {static: true}) codeElement?: ElementRef;
  public form: {title: string, key: string, display: string, components: any};
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
  formDisplayType = new FormControl('form');
  destroy$ = new Subject();
  crudUsers = new FormControl<any>([]);
  viewUsers = new FormControl<any>([]);

  constructor(
    private transportService: DataTransportService,
    private notif: NotificationsService,
    private location: Location,
    private activatedRoute: ActivatedRoute,
    private formService: FormsService
  )
  {
    this.editMode = this.transportService.isFormEdit.value;
    this.activatedRoute.queryParams?.subscribe(data => {
      if(data['key']) {
        this.formService.getFormByKey(data['key'])
        .pipe(takeUntil(this.destroy$)).subscribe((response: any) => {
          if(response) {
            this.form = response;
            this.formTitleControl.setValue(response?.title);
          }
        })
      }
      if(this.editMode === true) {
        this.form = this.transportService.sendFormDataForEdit.value;
        this.formTitleControl.setValue(this.transportService.sendFormDataForEdit.value.title);
        this.formTitleControl.disable();
      }
      else {
        this.form = {
          title: this.formTitleControl?.value,
          key: '',
          display: this.formDisplayType.value,
          components: []
        };
      }
    })
  }

  onChange(event: any) {
    this.refreshForm.emit({
      property: 'form',
      value: event.form
    });
    event.form.display = this.formDisplayType?.value;
    event.form.title = this.formTitleControl?.value;
    this.formValue = event.form;
    this.form?.components?.map(val => {
      if(val?.label && val?.label === 'Upload') {
        val.storage = "url";
        val.url = 'http://localhost:3000/v1/upload';
        val.uploadEnabled = true;
        val.sendFileAsQueryParam = false;
        val.input = true;
        val.type = 'file';
        val.multiple = true;
        return val
      }
      return val
    });
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
    this.form.title = this.formTitleControl?.value;
    this.form.display = this.formDisplayType?.value;
    this.form.key = this.formTitleControl?.value?.replace(/\s+/g, '-').trim().toLowerCase()
    if(this.editMode == false) {
      if(this.transportService.formBuilderData.value[0].components?.length > 0) {
        const data = [...this.transportService.formBuilderData.value, this.form];
        this.transportService.sendFormBuilderData(data);
        this.location.back()
      }
      else {
        this.transportService.sendFormBuilderData([this.form]);
        this.location.back()
      }
    }
    else {
      const data = this.transportService.formBuilderData.value?.map(val => {
        if(val.title == this.form?.title) {
          val = this.form
        }
        return val
      });
      this.transportService.sendFormBuilderData(data);
      this.location.back()
    }
  }

  setSelectValue(event: any) {
    this.formDisplayType.setValue(event.target.value);
  }

  cancelFormData() {
    if(this.editMode == false) {
      this.transportService.sendFormBuilderData([{title: '', key: '', display: '', components: []}]);
      this.location.back()
    }
    else {
      const data = this.transportService.formBuilderData.value?.map(val => {
        if(val.title == this.form?.title) {
          val = this.form
        }
        return val
      });
      this.transportService.sendFormBuilderData(data);
      this.location.back()
    }
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
