import { Component, ViewChild, EventEmitter, ElementRef, OnDestroy, OnInit, Injector, Inject, AfterViewInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FormioRefreshValue, FormioUtils } from '@formio/angular';
import { TuiDialogService, TuiNotification } from '@taiga-ui/core';
import { NotificationsService } from 'src/core/core-services/notifications.service';
import { Subject, takeUntil } from 'rxjs';
import { FormsService } from '../../services/forms.service';
import { Location } from '@angular/common';
import { StorageItem, getItem, removeItem } from 'src/core/utils/local-storage.utils';
import { DashboardService } from 'src/app/modules/dashboard/dashboard.service';
import { CodeValidator, FormKeyValidator } from 'src/core/utils/utility-functions';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { DialogTemplate } from '../../templates/permission-template.component';
import { DataTransportService } from 'src/core/core-services/data-transport.service';
import { environment } from 'src/environments/environment';

@Component({
  templateUrl: './edit-form.component.html',
  styleUrls: ['./edit-form.component.scss']
})
export class EditFormComponent implements OnDestroy, OnInit, AfterViewInit {
  @ViewChild('json', {static: true}) jsonElement?: ElementRef;
  @ViewChild('code', {static: true}) codeElement?: ElementRef;
  public form: any;
  public refreshForm: EventEmitter<FormioRefreshValue> = new EventEmitter();
  activeIndex: number = 0;
  formValue: any;
  editMode: boolean = false;
  options: any = {
    "disableAlerts": true,
    "noDefaultSubmitButton": true
  }
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
  formCodeControl = new FormControl({value: '', disabled: true}, Validators.compose([
    Validators.required
  ]), [CodeValidator.createValidator(this.dashboard, 'form')]);
  formDisplayType = new FormControl('form');
  destroy$ = new Subject();
  editFormID: string;
  submoduleIDForNewForm: string;
  crudUsers = new FormControl<any>([]);
  viewUsers = new FormControl<any>([]);
  creatingForm = new Subject<boolean>()

  constructor(
    private notif: NotificationsService,
    private activatedRoute: ActivatedRoute,
    private formService: FormsService,
    private _location: Location,
    private dashboard: DashboardService,
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
    @Inject(Injector) private readonly injector: Injector,
    private transportService: DataTransportService
  )
  {
    this.activatedRoute?.queryParams
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => {
      if(data['id']) {
        this.editFormID = data['id'];
        this.formService.getFormById(data['id'])
        .pipe(takeUntil(this.destroy$)).subscribe((response: any) => {
          if(response) {
            FormioUtils.eachComponent(response?.components, (component) => {
              if(component.type == 'select') {
                component.template = component?.template?.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
              }
              if(component.type == 'editgrid') {
                for (const key in component.templates) {
                  component.templates[key] = component.templates[key]?.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
                }
              }
            })
            this.form = response;
            this.formTitleControl.setValue(response?.title);
            this.formCodeControl.setValue(response?.key);
          }
        })
      }
      else if(data['submoduleID']) {
        this.form = {
          title: this.formTitleControl?.value,
          key: this.formCodeControl?.value,
          display: this.formDisplayType.value || null,
          components: []
        };
      }
      else {
        this.form = {
          title: this.formTitleControl?.value,
          key: this.formCodeControl?.value,
          display: this.formDisplayType.value || null,
          components: []
        };
      }
    })
  }

  ngOnInit(): void {
    this.dashboard.items = [
      ...getItem(StorageItem.editBreadcrumbs),
      {
        caption: getItem(StorageItem.formKey) || 'Add Form',
        routerLink: `/forms/edit-form?id=${this.editFormID}`
      }
    ];

    this.transportService.updatedComponent.pipe(takeUntil(this.destroy$)).subscribe(value => {
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
  }

  triggerPermissionBtnOnTabChange() {
    setTimeout(() => this.addCustomEventTrigger(), 2000)
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
    if(event.component?.type == 'select') {
      event.component.template = event.component?.template?.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    }
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
        jsonElement?.appendChild(document.createTextNode(JSON.stringify(this.formValue || this.form, null, 4)));
    }, 500)
  }

  submitFormData() {
    if(!this.formTitleControl?.value || this.formTitleControl?.value == '' || !this.formCodeControl?.value || this.formCodeControl?.value == '' || this.formCodeControl?.invalid) {
      return this.notif.displayNotification('Please provide a valid title and code for your form', 'Edit Form', TuiNotification.Warning)
    }
    if(this.form?.components?.length == 0) {
      return this.notif.displayNotification('Your form cannot be empty!', 'Edit Form', TuiNotification.Warning)
    }
    removeItem(StorageItem.approvers)
    this.creatingForm.next(true)
    FormioUtils.eachComponent(this.form?.components, (component) => {
      if(component.type == 'select') {
        component.template = component?.template?.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
      }
      if(component.type == 'editgrid') {
        for (const key in component.templates) {
          component.templates[key] = component.templates[key]?.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
        }
      }
    })
    const formData = {
      title: this.formTitleControl?.value,
      key: this.formCodeControl?.value,
      display: this.form?.display ?? this.formDisplayType.value,
      components: this.form?.components
    }
    const formFromEditModule = getItem(StorageItem.formEdit)
    if(this.editFormID) {
      this.formService.updateForm(this.editFormID, formData)
      .pipe(takeUntil(this.destroy$)).subscribe(val => {
        if(val) {
          if(formFromEditModule) {
            removeItem(StorageItem.formEdit)
            setTimeout(() => this._location.back(), 800)
          }
          else {
            this._location.back()
          }
          this.creatingForm.next(false)
        }
        else {
          this.creatingForm.next(false)
        }
      });
    }
    else {
      Object.assign(formData, {subModuleId: this.transportService.subModuleID?.value})
      this.formService.createForm(formData)
      .pipe(takeUntil(this.destroy$)).subscribe(val => {
        if(val) {
          if(formFromEditModule) {
            removeItem(StorageItem.formEdit)
            setTimeout(() => this._location.back(), 800)
          }
          else {
            this._location.back()
          }
          this.creatingForm.next(false)
        }
        else {
          this.creatingForm.next(false)
        }
      });
    }
  }

  setSelectValue(event: any) {
    this.formDisplayType.setValue(event.target.value);
  }

  cancelFormData() {
    removeItem(StorageItem.approvers)
    const formFromEditModule = getItem(StorageItem.formEdit)
    if(formFromEditModule) {
      removeItem(StorageItem.formEdit)
      this._location.back()
    }
    else {
      this._location.back()
    }
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
