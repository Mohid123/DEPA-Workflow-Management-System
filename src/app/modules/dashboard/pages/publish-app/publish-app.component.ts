import { Component, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import  { Subject, takeUntil, Observable, of, map } from 'rxjs';
import { NotificationsService } from 'src/core/core-services/notifications.service';
import { setItem, StorageItem, getItem } from 'src/core/utils/local-storage.utils';
import { TuiNotification } from '@taiga-ui/core';
@Component({
  selector: 'app-publish-app',
  templateUrl: './publish-app.component.html',
  styleUrls: ['./publish-app.component.scss']
})
export class PublishAppComponent implements OnDestroy {
  destroy$ = new Subject();
  localStorageApp: any;
  appNameLength: Observable<number> = of(0);
  shortDescLength: Observable<number> = of(0);
  activeIndex: number = getItem(StorageItem.activeIndex) || 0;
  readonly tabs = [
    {
      text: 'App Details'
    },
    {
      text: 'Listing Details'
    },
    {
      text: 'App Graphics'
    },
    {
      text: 'Published'
    }
  ];
  publishAppForm!: FormGroup;
  readonly categoryOtions = [
    'Human Resources',
    'Networking',
    'Games',
    'E-Commerce',
    'Finance',
    'Management',
  ];
  readonly roles = [
    'User',
    'Admin',
    'Any'
  ]
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
      shortDescription: [item?.shortDescription || null, Validators.compose([Validators.required, Validators.maxLength(50)])],
      fullDescription: [item?.fullDescription || null, Validators.required],
      appLink: [item?.appLink || null, Validators.required],
      appCategories: [item?.appCategories || null, Validators.required],
      roles: [item?.roles || null],
    })
  }

  getTextFieldLength() {
    this.appNameLength = this.f['appName'].valueChanges.pipe(map((val: string) => val.trim().length));
    this.shortDescLength = this.f['shortDescription'].valueChanges.pipe(map((val: string) => val.trim().length));
  }

  nextStep() {
    if(this.activeIndex !== 3)
    switch(this.activeIndex) {
      case 0:
        if(this.f['appName'].invalid || this.f['shortDescription'].invalid || this.f['fullDescription'].invalid) {
          return ['appName', 'shortDescription', 'fullDescription'].forEach(val => this.f[val].markAsDirty())
        }
        else {
          this.moveNext()
        }
        break;
      case 1:
        if(this.f['appLink'].invalid || this.f['appCategories'].invalid) {
          return ['appLink', 'appCategories'].forEach(val => this.f[val].markAsDirty())
        }
        else {
          this.moveNext()
        }
        break;
      case 2:
        // handle image validation here
      default:
        this.moveNext()
    }
  }

  previousStep() {
    if(this.activeIndex !== 0)
    this.activeIndex--;
    setItem(StorageItem.activeIndex, this.activeIndex)
  }

  moveNext() {
    this.activeIndex++;
    setItem(StorageItem.activeIndex, this.activeIndex);
    setItem(StorageItem.publishAppValue, this.publishAppForm.value)
  }

  onFileSelect(event: any) {
    const file = event?.target?.files[0];
    if(this.calculateFileSize(file) == true) {
      this.calculateAspectRatio(file).then((res) => {
        if(res == false) {
          this.notif.displayNotification('Image width and height should be 500px (1:1 aspect ratio)', 'File Upload', TuiNotification.Warning)
        }
        else {
          this.notif.displayNotification('File is valid', 'File Upload', TuiNotification.Success)
        }
      });
    }
  }

  calculateAspectRatio(image: any) {
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
  
  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
