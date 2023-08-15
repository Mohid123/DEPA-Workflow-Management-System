import { Component, ViewChild, EventEmitter, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormioRefreshValue } from '@formio/angular';
import { TuiNotification } from '@taiga-ui/core';
import { NotificationsService } from 'src/core/core-services/notifications.service';
import { Subject, takeUntil } from 'rxjs';
import { FormsService } from '../../services/forms.service';
import { Location } from '@angular/common';
import { StorageItem, getItem, removeItem } from 'src/core/utils/local-storage.utils';
import { AuthService } from 'src/app/modules/auth/auth.service';
import { DashboardService } from 'src/app/modules/dashboard/dashboard.service';

@Component({
  templateUrl: './edit-form.component.html',
  styleUrls: ['./edit-form.component.scss']
})
export class EditFormComponent implements OnDestroy, OnInit {
  @ViewChild('json', {static: true}) jsonElement?: ElementRef;
  @ViewChild('code', {static: true}) codeElement?: ElementRef;
  public form: {title: string, key: string, display: string, components: []};
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
    private activatedRoute: ActivatedRoute,
    private formService: FormsService,
    private _location: Location,
    private auth: AuthService,
    private dashboard: DashboardService
  )
  {
    this.activatedRoute?.queryParams?.subscribe(data => {
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
          title: this.formTitleControl?.value, key: null, display: this.formDisplayType.value || null, components: []};
      }
      else {
        this.form = {
          title: this.formTitleControl?.value, key: null, display: this.formDisplayType.value || null, components: []};
      }
    })
  }

  ngOnInit(): void {
    // this.activatedRoute.queryParams.pipe(takeUntil(this.destroy$)).subscribe(val => {
    //   if(Object.keys(val).length > 0) {
    //     const hierarchy = getItem(StorageItem.navHierarchy);
    //     hierarchy.forEach(val => {
    //       val.routerLink = `/modules/${val.caption}?moduleID=${getItem(StorageItem.moduleID)}`
    //     })
    //     if(this.dashboard.previousRoute && !this.dashboard.previousRoute.includes('moduleCode')) {
    //       this.dashboard.items = [...hierarchy, {
    //         caption: 'Add Submission',
    //         routerLink: `/modules/${getItem(StorageItem.moduleSlug)}/add-submission/${getItem(StorageItem.moduleID)}`
    //       }];
    //     }
    //     if(this.dashboard.previousRoute && this.dashboard.previousRoute.includes('moduleCode')) {
    //       this.dashboard.items = [{
    //         caption: 'Edit App',
    //         routerLink: `/modules/edit-module/${getItem(StorageItem.moduleID)}?moduleCode=${StorageItem.moduleSlug}`
    //       }];
    //     }
    //   }
    // })
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
      Object.assign(formData, {subModuleId: getItem(StorageItem.moduleID)})
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
