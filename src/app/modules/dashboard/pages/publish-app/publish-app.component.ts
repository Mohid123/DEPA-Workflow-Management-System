import { Component, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import  { Subject, Observable, of, map, takeUntil } from 'rxjs';
import { NotificationsService } from 'src/core/core-services/notifications.service';
import { setItem, StorageItem, getItem, removeItem } from 'src/core/utils/local-storage.utils';
import { TuiNotification } from '@taiga-ui/core';
import {TUI_ARROW} from '@taiga-ui/kit';
import { Module } from 'src/core/models/module.model';

@Component({
  templateUrl: './publish-app.component.html',
  styleUrls: ['./publish-app.component.scss']
})
export class PublishAppComponent implements OnDestroy {
  destroy$ = new Subject();
  file: any;
  localStorageApp: any;
  appNameLength: Observable<number> = of(0);
  activeIndex: number = getItem(StorageItem.activeIndex) || 0;
  readonly arrow = TUI_ARROW;
  readonly tabs = [
    {
      text: 'Module Details'
    },
    {
      text: 'Default Workflow'
    },
    {
      text: 'Module Graphics'
    },
    {
      text: 'Published'
    }
  ];
  publishAppForm!: FormGroup;
  readonly categoryOptions = [
    'Human Resources',
    'Networking',
    'Games',
    'E-Commerce',
    'Finance',
    'Management'
  ];
  readonly conditions = [
    'OR',
    'AND',
    'ANY'
  ];

  constructor(private fb: FormBuilder, private notif: NotificationsService) {
    this.localStorageApp = getItem(StorageItem.publishAppValue);
    this.initAppForm(this.localStorageApp);
    this.getTextFieldLength();
  }

  get f() {
    return this.publishAppForm.controls;
  }

  initAppForm(item?: any) {
    this.publishAppForm = this.fb.group({
      appName: [item?.appName || null, Validators.compose([Validators.required, Validators.maxLength(20)])],
      fullDescription: [item?.fullDescription || null, Validators.required],
      appLink: [item?.appLink || null, Validators.compose([Validators.required, Validators.pattern(/^(http|https)\:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}$/)])],
      appCategories: [item?.appCategories || null, Validators.required],
      appIcon: [item?.appIcon || null],
      workflows: this.fb.array(
        item?.workflows?.map((val: { condition: any; approverIds: any; }) => {
          return this.fb.group({
            condition: [val.condition, Validators.required],
            approverIds: [val.approverIds, Validators.required]
          })
        })
        ||
        [
          this.fb.group({
            condition: ['', Validators.required],
            approverIds: [[], Validators.required]
          })
        ]
      )
    });
    this.file = item?.appIcon
  }

  get workflows() {
    return this.f['workflows'] as FormArray
  }

  addWorkflowStep() {
    const workflowStepForm = this.fb.group({
      condition: ['', Validators.required],
      approverIds: [[], Validators.required]
    });
    this.workflows.push(workflowStepForm);
  }

  removeWorkflowStep(index: number) {
    this.workflows.removeAt(index);
  }

  getTextFieldLength() {
    this.appNameLength = this.f['appName'].valueChanges.pipe(map((val: string) => val.trim().length), takeUntil(this.destroy$));
  }

  getApproverList(value: string[], index: number) {
    this.workflows.at(index)?.get('approverIds')?.setValue(value);
  }

  nextStep(): void {
    if(this.activeIndex !== 3) {
      switch(this.activeIndex) {
        case 0:
          if(this.f['appName'].invalid || this.f['appLink'].invalid || this.f['fullDescription'].invalid || this.f['appCategories'].invalid) {
            return ['appName', 'appLink', 'fullDescription', 'appCategories'].forEach(val => this.f[val].markAsTouched())
          }
          this.moveNext()
          break;
        case 1:
          if(this.workflows.controls.map(val => val.get('approverIds')?.value.length == 0).includes(true)) {
            return this.notif.displayNotification('Please complete the default workflow', 'Create Module', TuiNotification.Warning);
          }
          if(this.workflows.controls.map(val => val.get('condition')?.value).includes('') === true) {
            return this.notif.displayNotification('Please complete the default workflow', 'Create Module', TuiNotification.Warning);
          }
          this.moveNext()
          break;
        case 2:
          if(!this.file && this.f['appIcon'].value == null) {
            return this.notif.displayNotification('Please provide a valid icon for your app', 'Create Module', TuiNotification.Warning)
          }
          this.moveNext()
          break;
        default:
          this.moveNext()
      }
    }
    if(this.activeIndex == 3) {
      this.submitNewModule()
    }
  }

  previousStep(): void {
    if(this.activeIndex !== 0)
    this.activeIndex--;
    setItem(StorageItem.activeIndex, this.activeIndex)
  }

  moveNext(): void {
    this.activeIndex++;
    setItem(StorageItem.activeIndex, this.activeIndex);
    setItem(StorageItem.publishAppValue, this.publishAppForm.value);
    console.log(this.publishAppForm.value)
  }

  onFileSelect(event: any) {
    const file = event?.target?.files[0];
    if(this.calculateFileSize(file) == true) {
      this.calculateAspectRatio(file).then((res) => {
        if(res == false) {
          this.notif.displayNotification('Image width and height should be 500px (1:1 aspect ratio)', 'File Upload', TuiNotification.Warning)
        }
        else {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = (e) => {
            this.file = reader.result;
            this.f['appIcon'].setValue(this.file)
          };
        }
      });
    }
    else {
      this.notif.displayNotification('Allowed file types are JPG/PNG/WebP. File size cannot exceed 1MB', 'File Upload', TuiNotification.Warning)
    }
  }

  calculateAspectRatio(image: any): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(image);
      reader.onload = async (e: any) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = async () => {
          let height = img.naturalHeight;
          let width = img.naturalWidth;
          if ((height > 500 || width > 500) && width/height !== 1) {
            resolve(false)
          }
          resolve(true)
        };
      }
    })
  }

  calculateFileSize(file: any): boolean {
    const maxSize = 1024 * 1024;
    if((file.type == 'image/jpg' || file.type == 'image/png' || file.type == 'image/webp') && file.size <= maxSize) {
      return true
    }
    return false
  }

  submitNewModule() {
    const payload: Partial<Module> = {
      categoryId: this.f['appCategories']?.value,
      title: this.f['appName']?.value,
      description: this.f['fullDescription']?.value,
      url: this.f['appLink']?.value,
      image: this.f['appIcon']?.value,
      defaultWorkflow: this.workflows.value
    }
    console.log(payload)
    setTimeout(() => {
      this.activeIndex = 0;
      this.publishAppForm.reset();
      removeItem(StorageItem.publishAppValue);
      removeItem(StorageItem.activeIndex);
      this.file = null;
    }, 1500)
  }
  
  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
