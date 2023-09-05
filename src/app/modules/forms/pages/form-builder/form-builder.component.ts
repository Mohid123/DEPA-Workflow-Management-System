import { Component, ViewChild, EventEmitter, ElementRef, OnInit, Inject, Injector, AfterViewInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FormioRefreshValue } from '@formio/angular';
import { TuiDialogService, TuiNotification } from '@taiga-ui/core';
import { DataTransportService } from 'src/core/core-services/data-transport.service';
import { NotificationsService } from 'src/core/core-services/notifications.service';
import { Subject, takeUntil } from 'rxjs';
import { FormsService } from '../../services/forms.service';
import { Location } from '@angular/common';
import { environment } from 'src/environments/environment';import { StorageItem, getItem, removeItem } from 'src/core/utils/local-storage.utils';
import { DashboardService } from 'src/app/modules/dashboard/dashboard.service';
import {  FormKeyValidator } from 'src/core/utils/utility-functions';
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
  ]), [FormKeyValidator.createValidator(this.dashboard)]);
  formDisplayType = new FormControl('form');
  destroy$ = new Subject();
  crudUsers = new FormControl<any>([]);
  viewUsers = new FormControl<any>([]);
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
            this.formValue = this.form
          }
        })
      }
      if(this.editMode === true) {
        this.form = this.transportService.sendFormDataForEdit.value;
        this.formTitleControl.setValue(this.transportService.sendFormDataForEdit.value.title);
        this.formTitleControl.disable();
        this.formValue = this.form
      }
      else {
        this.form = {
          title: this.formTitleControl?.value,
          key: '',
          display: this.formDisplayType.value,
          components: []
        };
      }
      this.formValue = this.form
    })
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.pipe(takeUntil(this.destroy$)).subscribe(val => {
      if(Object.keys(val).length == 0) {
        const hierarchy = getItem(StorageItem.navHierarchy);
        if(hierarchy && this.dashboard.previousRoute && !this.dashboard.previousRoute.includes('?')) {
          hierarchy.forEach(val => {
            val.routerLink = `/modules/${val.code}?moduleID=${getItem(StorageItem.moduleID)}`
          })
          this.dashboard.items = [...hierarchy,
            {
              caption: 'Add App',
              routerLink: `/modules/add-module/${getItem(StorageItem.moduleID)}`
            },
            {
              caption: 'Add Form',
              routerLink: `/forms/form-builder`
            }
          ];
        }
        else {
          this.dashboard.items = [
            {
              caption: 'Add App',
              routerLink: `/modules/add-module/${getItem(StorageItem.moduleID)}`
            },
            {
              caption: 'Add Form',
              routerLink: `/forms/form-builder`
            }
          ];
        }
      }
      else {
        this.dashboard.items = [
          {
            caption: 'Add App',
            routerLink: `/modules/add-module/${getItem(StorageItem.moduleID)}`
          },
          {
            caption: 'Add Form',
            routerLink: `/forms/form-builder`
          }
        ];
      }
    });

    this.transportService.updatedComponent
    .pipe(takeUntil(this.destroy$)).subscribe(value => {
      if(value) {
        this.form.components = this.form?.components?.map(comp => {
          if(comp.key === value.key) {
            comp = value;
            return comp
          }
          return comp
        })
      }
    })
  }

  ngAfterViewInit(): void {
    this.onJsonView()
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
    this.formValue = event.form;
    if(event.component?.type == 'file') {
      event.component.storage = "url";
      event.component.url = `${environment.apiUrl}/upload`;
      event.component.uploadEnabled = true;
      event.component.input = true;
      event.component.multiple = true;
    }
    this.addCustomEventTrigger()
  }

  addCustomEventTrigger() {
    // debugger
    let checkIfExists = document.getElementById('custom-div');
    if(!checkIfExists) {
      // debugger
      let componentMenu = document.getElementsByClassName('component-btn-group');
      Array.from(componentMenu).forEach((value, index) => {
        let tooltip = document.createElement('div');
        let div = document.createElement('div');
        div.id = 'custom-div'
        div.setAttribute('class', 'btn btn-xxs btn-primary component-settings-button component-settings-button-depa relative');
        div.tabIndex = -1;
        div.role = 'button';
        div.ariaLabel = 'Permissions Button';
        div.innerHTML = `<i class="fa fa-key"></i>`;
        div.addEventListener('click', () => {
          let comp = this.form?.components[index];
          this.openPermissionDialog(comp)
        })
        div.addEventListener('mouseover', () => {
          tooltip.setAttribute('class', 'absolute z-30 -top-8 -left-10 bg-black bg-opacity-80 text-white text-[13px] font-medium rounded-md p-2');
          tooltip.innerText = 'Permissions'
          div.append(tooltip)
        })
        div.addEventListener('mouseleave', () => {
          tooltip.remove()
        })
        value.append(div);
      })
    }
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
    if(!this.formTitleControl?.value || this.formTitleControl?.value == '') {
      return this.notif.displayNotification('Please provide a title for your form', 'Create Form', TuiNotification.Warning)
    }
    if(this.form?.components?.length == 0) {
      return this.notif.displayNotification('You have not created a form!', 'Create Form', TuiNotification.Warning)
    }
    removeItem(StorageItem.approvers)
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
    removeItem(StorageItem.approvers)
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
