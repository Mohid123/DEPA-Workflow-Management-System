import { Component, ViewChild, EventEmitter, ElementRef, OnInit, Inject, Injector, AfterViewInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FormioRefreshValue, FormioUtils } from '@formio/angular';
import { TuiDialogService, TuiNotification } from '@taiga-ui/core';
import { DataTransportService } from 'src/core/core-services/data-transport.service';
import { NotificationsService } from 'src/core/core-services/notifications.service';
import { Subject, takeUntil } from 'rxjs';
import { FormsService } from '../../services/forms.service';
import { Location } from '@angular/common';
import { environment } from 'src/environments/environment';
import { StorageItem, getItem, getItemSession, removeItem } from 'src/core/utils/local-storage.utils';
import { DashboardService } from 'src/app/modules/dashboard/dashboard.service';
import {  CodeValidator } from 'src/core/utils/utility-functions';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { DialogTemplate } from '../../templates/permission-template.component';

@Component({
  templateUrl: './form-builder.component.html',
  styleUrls: ['./form-builder.component.scss']
})
export class FormBuilderComponent implements OnInit, AfterViewInit {
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
  formTitleControl = new FormControl({value: '', disabled: this.editMode}, Validators.compose([
    Validators.required
  ]));
  formCodeControl = new FormControl({value: '', disabled: this.editMode}, Validators.compose([
    Validators.required
  ]),[CodeValidator.createValidator(this.dashboard, 'form')]);
  formDisplayType = new FormControl('form');
  destroy$ = new Subject();
  crudUsers = new FormControl<any>([]);
  viewUsers = new FormControl<any>([]);
  appKey: string;
  options: any = {
    "disableAlerts": true,
    "noDefaultSubmitButton": true
  }

  constructor(
    private transportService: DataTransportService,
    private notif: NotificationsService,
    private location: Location,
    private activatedRoute: ActivatedRoute,
    private formService: FormsService,
    private dashboard: DashboardService,
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
    @Inject(Injector) private readonly injector: Injector,
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
            this.formCodeControl.setValue(response?.key);
            this.formValue = this.form
          }
        })
      }
      if(this.editMode === true) {
        this.form = this.transportService.sendFormDataForEdit.value;
        this.formTitleControl.setValue(this.transportService.sendFormDataForEdit.value.title);
        this.formCodeControl.setValue(this.transportService.sendFormDataForEdit.value?.key);
        this.formValue = this.form
      }
      else {
        this.form = {
          title: this.formTitleControl?.value,
          key: this.formCodeControl?.value,
          display: this.formDisplayType.value,
          components: []
        };
      }
      this.formValue = this.form
    })
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.pipe(takeUntil(this.destroy$)).subscribe(val => {
      this.dashboard.items = [
        ...getItemSession(StorageItem.editBreadcrumbs),
        {
          caption: 'Add Form',
          routerLink: `/forms/form-builder`
        }
      ];
    });

    this.transportService.updatedComponent
    .pipe(takeUntil(this.destroy$)).subscribe(value => {
      if(value) {
        FormioUtils.eachComponent(this.form.components, (comp, path) => {
          if (comp.key === value.key) {
            Object.assign(comp, value);
            const pathArr = path.split('.');
            let currObj = this.form.components;
            for (let i = 0; i < pathArr.length - 1; i++) {
              const key = pathArr[i];
              currObj = currObj.find((obj) => obj.key === key);
              if (!currObj) {
                break;
              }
              currObj = currObj.components;
            }
            if (currObj) {
              const componentIndex = currObj.findIndex((obj) => obj.key === value.key);
              if (componentIndex !== -1) {
                currObj[componentIndex] = comp;
              }
            }
          }
        }, true);
      }
    })
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.addCustomEventTrigger(), 2000)
    this.onJsonView()
  }

  triggerPermissionBtnOnTabChange() {
    setTimeout(() => this.addCustomEventTrigger(), 2000)
  }

  goback() {
    this.location.back()
  }

  onChange(event: any) {
    this.refreshForm.emit({
      property: 'form',
      value: event.form
    });
    event.form.display = this.formDisplayType?.value;
    event.form.title = this.formTitleControl?.value;
    if(event.component?.type == 'file') {
      event.component.storage = "url";
      event.component.url = `${environment.apiUrl}/upload`;
      event.component.uploadEnabled = true;
      event.component.input = true;
      event.component.multiple = true;
    }
    if(event.component?.type == 'select') {
      event.component?.template?.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    }
    this.formValue = event.form;
    this.addCustomEventTrigger()
  }

  addCustomEventTrigger() {
    let componentMenu = document.getElementsByClassName('component-btn-group');
    Array.from(componentMenu).forEach((value, index) => {
      let existingCustomDiv = value.querySelector('#custom-div');
      if (existingCustomDiv) {
        // If the custom icon already exists for this component, skip adding it again
        return;
      }

      let tooltip = document.createElement('div');
      let div = document.createElement('div');
      div.id = 'custom-div';
      div.setAttribute('class', 'btn btn-xxs btn-primary component-settings-button component-settings-button-depa relative');
      div.tabIndex = -1;
      div.role = 'button';
      div.ariaLabel = 'Permissions Button';
      div.innerHTML = `<i class="fa fa-key"></i>`;
      div.addEventListener('click', () => {
        let comp = FormioUtils.flattenComponents(this.form.components, true)
        this.openPermissionDialog(Object.values(comp)[index]);
      });
      div.addEventListener('mouseover', () => {
        tooltip.setAttribute('class', 'absolute z-30 -top-8 -left-10 bg-black bg-opacity-80 text-white text-[13px] font-medium rounded-md p-2');
        tooltip.innerText = 'Permissions';
        div.append(tooltip);
      });
      div.addEventListener('mouseleave', () => {
        tooltip.remove();
      });
      value.append(div);
    });
  }

  openPermissionDialog(
    data: any
  ): void {
    this.dialogs.open<any>(
      new PolymorpheusComponent(DialogTemplate, this.injector),
      {
        data: data,
        dismissible: false,
        closeable: false
      }
    ).pipe(takeUntil(this.destroy$)).subscribe();
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
    if(!this.formTitleControl?.value || this.formTitleControl?.value == '' || !this.formCodeControl?.value || this.formCodeControl?.value == '' || this.formCodeControl?.invalid) {
      return this.notif.displayNotification('Please provide a valid title and code for your form', 'Create Form', TuiNotification.Warning)
    }
    if(this.form?.components?.length == 0) {
      return this.notif.displayNotification('You have not created a form!', 'Create Form', TuiNotification.Warning)
    }
    removeItem(StorageItem.approvers)
    this.form.title = this.formTitleControl?.value;
    this.form.display = this.formDisplayType?.value;
    this.form.key = this.formCodeControl?.value;
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
      if(this.transportService.formBuilderData.value?.components?.length == 0 || Object.keys(this.transportService.formBuilderData.value)?.length == 0) {
        this.transportService.formBuilderData.next([this.form])
      }
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
    removeItem(StorageItem.approvers)
    if(this.editMode == false) {
      this.transportService.sendFormBuilderData([{title: '', key: '', display: '', components: []}]);
      this.location.back()
    }
    else {
      if(this.transportService.formBuilderData.value?.components?.length == 0 || Object.keys(this.transportService.formBuilderData.value)?.length == 0) {
        this.transportService.formBuilderData.next([this.form])
      }
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
