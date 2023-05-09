import { Component, ViewChild, EventEmitter, ElementRef, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormioRefreshValue } from '@formio/angular';
import { TuiNotification } from '@taiga-ui/core';
import { NotificationsService } from 'src/core/core-services/notifications.service';
import { Subject, takeUntil } from 'rxjs';
import { FormsService } from '../../services/forms.service';

@Component({
  templateUrl: './edit-form.component.html',
  styleUrls: ['./edit-form.component.scss']
})
export class EditFormComponent implements OnDestroy {
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

  constructor(
    private notif: NotificationsService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private formService: FormsService)
  {
    this.activatedRoute.params?.subscribe(data => {
      if(data['id']) {
        this.editFormID = data['id'];
        this.formService.getFormById(data['id'])
        .pipe(takeUntil(this.destroy$)).subscribe((response: any) => {
          if(response) {
            this.form = response;
            this.formTitleControl.setValue(response?.title);
          }
          else {
            this.form = {title: this.formTitleControl?.value, key: '', display: this.formDisplayType.value, components: []};
          }
        })
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
    const formData = {
      title: this.formTitleControl?.value,
      key: this.form?.key,
      display: this.form?.display,
      components: this.form?.components
    }
    this.formService.updateForm(this.editFormID, formData).pipe(takeUntil(this.destroy$)).subscribe();
  }

  setSelectValue(event: any) {
    this.formDisplayType.setValue(event.target.value);
  }

  cancelFormData() {
    // this.router.navigate(['/appListing/add-submodule']);
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}