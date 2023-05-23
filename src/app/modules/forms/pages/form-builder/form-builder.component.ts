import { Component, ViewChild, EventEmitter, ElementRef, HostListener, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormioRefreshValue } from '@formio/angular';
import { TuiNotification } from '@taiga-ui/core';
import { DataTransportService } from 'src/core/core-services/data-transport.service';
import { NotificationsService } from 'src/core/core-services/notifications.service';
import { Subject, takeUntil } from 'rxjs';
import { FormsService } from '../../services/forms.service';

@Component({
  templateUrl: './form-builder.component.html',
  styleUrls: ['./form-builder.component.scss']
})
export class FormBuilderComponent {
  @ViewChild('json', {static: true}) jsonElement?: ElementRef;
  @ViewChild('code', {static: true}) codeElement?: ElementRef;
  public form: {title: string, key: string, display: string, components: [], permissions: any};
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
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private formService: FormsService)
  {
    this.editMode = this.transportService.isFormEdit.value;
    this.activatedRoute.queryParams?.subscribe(data => {
      if(data['formID']) {
        this.formService.getFormById(data['formID'])
        .pipe(takeUntil(this.destroy$)).subscribe((response: any) => {
          if(response) {
            this.form = response;
            this.formTitleControl.setValue(response?.title);
          }
        })
      }
      if(this.editMode === true) {
        this.form = this.transportService.sendFormDataForEdit.value;
        this.transportService.sendFormDataForEdit.value?.permissions?.map(data => {
          if(data?.options?.canAdd == true) {
            this.crudUsers?.setValue([...this.crudUsers?.value, data?.user])
          }
          else if(data?.options?.canAdd == false) {
            this.viewUsers?.setValue([...this.viewUsers?.value, data?.user])
          }
        })
        this.formTitleControl.setValue(this.transportService.sendFormDataForEdit.value.title);
        this.formTitleControl.disable();
      }
      else {
        this.form = {
          title: this.formTitleControl?.value,
          key: '',
          display: this.formDisplayType.value,
          components: [],
          permissions: []
        };
      }
    })
  }

  // @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
  //   event.preventDefault();
  //   event.returnValue = false;
  // }

  onChange(event: any) {
    this.refreshForm.emit({
      property: 'form',
      value: event.form
    });
    event.form.display = this.formDisplayType?.value;
    event.form.title = this.formTitleControl?.value;
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
    if(this.viewUsers?.value?.length == 0 || this.crudUsers?.value?.length == 0) {
      return this.notif.displayNotification('You have not set permissions for the form!', 'Create Form', TuiNotification.Warning)
    }
    if(this.checkIfArrayMatch()?.includes(true)) {
      return this.notif.displayNotification('View users and CRUD users cannot be same!', 'Create Form', TuiNotification.Warning)
    }
    const CRUDusers = this.crudUsers?.value?.map(val => {
      return {
        user: {id: val?.id, name: val?.name},
        options: {
          canEdit: true,
          canDelete: true,
          canView: true,
          canSave: true,
          canAdd: true
        }
      }
    });
    const viewOnlyUsers = this.viewUsers?.value?.map(val => {
      return {
        user: {id: val?.id, name: val?.name},
        options: {
          canEdit: false,
          canDelete: false,
          canView: true,
          canSave: false,
          canAdd: false
        }
      }
    });
    this.form.permissions = [...CRUDusers, ...viewOnlyUsers]
    this.form.title = this.formTitleControl?.value;
    this.form.display = this.formDisplayType?.value;
    this.form.key = this.formTitleControl?.value?.replace(/\s/g, '').toLowerCase() + '-' + Array(2).fill(null).map(() => Math.round(Math.random() * 16).toString(2)).join('')
    if(this.editMode == false) {
      if(this.transportService.formBuilderData.value[0].components?.length > 0) {
        const data = [...this.transportService.formBuilderData.value, this.form];
        this.transportService.sendFormBuilderData(data);
        this.router.navigate(['/appListing/add-submodule'], { queryParams: { moduleID: this.transportService.moduleID?.value } });
      }
      else {
        this.transportService.sendFormBuilderData([this.form]);
        this.router.navigate(['/appListing/add-submodule'], { queryParams: { moduleID: this.transportService.moduleID?.value } });
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
      this.router.navigate(['/appListing/add-submodule'], { queryParams: { moduleID: this.transportService.moduleID?.value } });
    }
  }

  setSelectValue(event: any) {
    this.formDisplayType.setValue(event.target.value);
  }

  cancelFormData() {
    if(this.editMode == false) {
      this.transportService.sendFormBuilderData([{title: '', key: '', display: '', components: [], permissions: []}]);
      this.router.navigate(['/appListing/add-submodule'], { queryParams: { moduleID: this.transportService.moduleID?.value } });
    }
    else {
      const data = this.transportService.formBuilderData.value?.map(val => {
        if(val.title == this.form?.title) {
          val = this.form
        }
        return val
      });
      this.transportService.sendFormBuilderData(data);
      this.router.navigate(['/appListing/add-submodule'], { queryParams: { moduleID: this.transportService.moduleID?.value } });
    }
  }

  setCRUDUsers(users: any[]) {
    this.crudUsers?.setValue(users);
  }

  setReadOnlyUsers(users: any[]) {
    this.viewUsers?.setValue(users)
  }

  checkIfArrayMatch(): boolean[] {
    const viewUserNames = this.viewUsers?.value?.map(data => data?.name);
    return this.crudUsers?.value?.map(data => {
      if(viewUserNames.includes(data?.name)) {
        return true
      }
      return false
    })
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
