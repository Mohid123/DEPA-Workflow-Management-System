import { Component, ViewChild, EventEmitter, ElementRef, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormioRefreshValue } from '@formio/angular';
import { TuiNotification } from '@taiga-ui/core';
import { NotificationsService } from 'src/core/core-services/notifications.service';
import { Subject, takeUntil } from 'rxjs';
import { FormsService } from '../../services/forms.service';
import { DataTransportService } from 'src/core/core-services/data-transport.service';

@Component({
  templateUrl: './edit-form.component.html',
  styleUrls: ['./edit-form.component.scss']
})
export class EditFormComponent implements OnDestroy {
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
  editFormID: string;
  submoduleIDForNewForm: string;
  crudUsers = new FormControl<any>([]);
  viewUsers = new FormControl<any>([]);

  constructor(
    private notif: NotificationsService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private formService: FormsService,
    private transportService: DataTransportService
  )
  {
    this.activatedRoute?.queryParams?.subscribe(data => {
      if(data['id']) {
        this.editFormID = data['id'];
        this.formService.getFormById(data['id'])
        .pipe(takeUntil(this.destroy$)).subscribe((response: any) => {
          if(response) {
            this.form = response;
            response?.permissions?.map(data => {
              if(data?.options?.canAdd == true) {
                this.crudUsers?.setValue([...this.crudUsers?.value, data?.user])
              }
              else if(data?.options?.canAdd == false) {
                this.viewUsers?.setValue([...this.viewUsers?.value, data?.user])
              }
            })
            this.formTitleControl.setValue(response?.title);
          }
        })
      }
      else if(data['submoduleID']) {
        this.form = {
          title: this.formTitleControl?.value, key: null, display: this.formDisplayType.value || null, components: [], permissions: []};
      }
      else {
        this.form = {
          title: this.formTitleControl?.value, key: null, display: this.formDisplayType.value || null, components: [], permissions: []};
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
      return this.notif.displayNotification('Please provide a title for your form', 'Edit Form', TuiNotification.Warning)
    }
    if(this.form?.components?.length == 0) {
      return this.notif.displayNotification('Your form cannot be empty!', 'Edit Form', TuiNotification.Warning)
    }
    if(this.form?.permissions?.length == 0) {
      return this.notif.displayNotification('You have not set permissions for the form!', 'Edit Form', TuiNotification.Warning)
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
    const formData = {
      title: this.formTitleControl?.value,
      key: this.form?.key ?? this.formTitleControl?.value?.replace(/\s/g, '').toLowerCase() + '-' + Array(2).fill(null).map(() => Math.round(Math.random() * 16).toString(2)).join(''),
      display: this.form?.display ?? this.formDisplayType.value,
      components: this.form?.components,
      permissions: this.form?.permissions
    }
    if(this.editFormID) {
      this.formService.updateForm(this.editFormID, formData).pipe(takeUntil(this.destroy$)).subscribe(val => {
        if(val) {
          setTimeout(() => this.router.navigate(['/appListing/edit-submodule', this.transportService.subModuleID?.value], {queryParams: {moduleCode: this.transportService?.moduleCode?.value, moduleID: this.transportService?.moduleID?.value}}), 1200)
        }
      });
    }
    else {
      Object.assign(formData, {subModuleId: this.transportService.subModuleID?.value})
      this.formService.createForm(formData).pipe(takeUntil(this.destroy$)).subscribe(val => {
        if(val) {
          setTimeout(() => this.router.navigate(['/appListing/edit-submodule', this.transportService.subModuleID?.value], {queryParams: {moduleCode: this.transportService?.moduleCode?.value, moduleID: this.transportService?.moduleID?.value}}), 1200)
        }
      });
    }
  }

  setSelectValue(event: any) {
    this.formDisplayType.setValue(event.target.value);
  }

  cancelFormData() {
    this.router.navigate(
      ['/appListing/edit-submodule', this.transportService.subModuleID?.value],
      {queryParams: {moduleCode: this.transportService?.moduleCode?.value, moduleID: this.transportService?.moduleID?.value}
    })
  }

  setCRUDUsers(users: string[]) {
    this.crudUsers?.setValue(users)
  }

  setReadOnlyUsers(users: string[]) {
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
