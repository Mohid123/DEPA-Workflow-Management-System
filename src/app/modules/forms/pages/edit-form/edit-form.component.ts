import { Component, ViewChild, EventEmitter, ElementRef, OnDestroy, OnInit, Injector, Inject, AfterViewInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FormioRefreshValue } from '@formio/angular';
import { TuiDialogService, TuiNotification } from '@taiga-ui/core';
import { NotificationsService } from 'src/core/core-services/notifications.service';
import { Subject, takeUntil } from 'rxjs';
import { FormsService } from '../../services/forms.service';
import { Location } from '@angular/common';
import { StorageItem, getItem, removeItem } from 'src/core/utils/local-storage.utils';
import { DashboardService } from 'src/app/modules/dashboard/dashboard.service';
import { FormKeyValidator } from 'src/core/utils/utility-functions';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { DialogTemplate } from '../../templates/permission-template.component';
import { DataTransportService } from 'src/core/core-services/data-transport.service';

@Component({
  templateUrl: './edit-form.component.html',
  styleUrls: ['./edit-form.component.scss']
})
export class EditFormComponent implements OnDestroy, OnInit, AfterViewInit {
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
  editFormID: string;
  submoduleIDForNewForm: string;
  crudUsers = new FormControl<any>([]);
  viewUsers = new FormControl<any>([]);

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
            this.form = response;
            this.formTitleControl.setValue(response?.title);
          }
        })
      }
      else if(data['submoduleID']) {
        this.form = {
          title: this.formTitleControl?.value, key: null, display: this.formDisplayType.value || null, components: []
        };
      }
      else {
        this.form = {
          title: this.formTitleControl?.value, key: null, display: this.formDisplayType.value || null, components: []
        };
      }
    })
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.pipe(takeUntil(this.destroy$)).subscribe(val => {
      const hierarchy = getItem(StorageItem.navHierarchy) || [];
      if(hierarchy && this.dashboard.previousRoute && this.dashboard.previousRoute.includes('edit-module')) {
        hierarchy.forEach(val => {
          val.routerLink = `/modules/${val.caption}?moduleID=${getItem(StorageItem.moduleID)}`
        })
        if(Object.keys(val).length == 0) {
          this.dashboard.items = [...hierarchy,
            {
              caption: 'Edit App',
              routerLink: ``
            },
            {
              caption: 'Edit Form',
              routerLink: `/forms/edit-form`
            }
          ];
        }
        else {
          this.dashboard.items = [
            {
              caption: 'Edit App',
              routerLink: ``
            },
            {
              caption: 'Edit Form',
              routerLink: `/forms/edit-form`
            }
          ];
        }
      }
      else if(hierarchy && this.dashboard.previousRoute && this.dashboard.previousRoute.includes('add-submission')) {
        this.dashboard.items = [
          ...hierarchy,
          {
            caption: 'Add Submission',
            routerLink: `/modules/${getItem(StorageItem.moduleSlug)}/add-submission/${getItem(StorageItem.moduleID)}`
          },
          {
            caption: 'Edit Form',
            routerLink: `/forms/edit-form`
          }
        ];
      }
      else {
        this.dashboard.items = [
          ...hierarchy,
          {
            caption: 'Edit App',
            routerLink: `/modules/edit-module/${getItem(StorageItem.moduleID)}`
          },
          {
            caption: 'Edit Form',
            routerLink: `/forms/edit-form`
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
    this.form?.components?.map((val: any) => {
      if(val?.label && val?.label === 'Upload') {
        val.storage = "url";
        val.url = 'http://localhost:3000/v1/upload';
        val.uploadEnabled = true;
        val.input = true;
        val.multiple = true;
        return val
      }
      return val
    });
    this.addCustomEventTrigger()
  }

  addCustomEventTrigger() {
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
    if(!this.formTitleControl?.value || this.formTitleControl?.value == '') {
      return this.notif.displayNotification('Please provide a title for your form', 'Edit Form', TuiNotification.Warning)
    }
    if(this.form?.components?.length == 0) {
      return this.notif.displayNotification('Your form cannot be empty!', 'Edit Form', TuiNotification.Warning)
    }
    removeItem(StorageItem.approvers)
    const formData = {
      title: this.formTitleControl?.value,
      key: this.formTitleControl?.value?.replace(/\s+/g, '-').toLowerCase(),
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
