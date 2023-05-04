import { Component, EventEmitter, OnDestroy } from '@angular/core';
import  { Subject, Observable, of, map, takeUntil, BehaviorSubject } from 'rxjs';
import { NotificationsService } from 'src/core/core-services/notifications.service';
import { setItem, StorageItem, getItem, removeItem } from 'src/core/utils/local-storage.utils';
import { TuiNotification } from '@taiga-ui/core';
import {TUI_ARROW} from '@taiga-ui/kit';
import { createModuleDetailsForm } from 'src/app/forms/forms';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DashboardService } from '../../dashboard.service';

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
  moduleData = new BehaviorSubject<any>({});
  refreshForm = new EventEmitter();
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

  categories: any

  options: any = {
    "disableAlerts": true
  };

  prePopulatedDataDetails: any;
  workflowForm: FormGroup;

  public moduleDetailsForm: any = createModuleDetailsForm;
  categoryDataForFormIOSelect = new BehaviorSubject<any>(null);

  constructor(private fb: FormBuilder, private notif: NotificationsService, private dashboard: DashboardService) {
    this.dashboard.getAllCategories().pipe(takeUntil(this.destroy$)).subscribe((value: any) => {
      this.categories = value?.map(data => {
        return {
          value: data?.id,
          label: data?.name
        }
      });
      this.moduleDetailsForm = {
        "title": "Module details form",
        "components": [
          {
            "label": "Module Title",
            "tableView": true,
            "validate": {
                "required": true
            },
            "key": "moduleTitle",
            "type": "textfield",
            "input": true
          },
          {
            "label": "Module URL",
            "tableView": true,
            "validate": {
                "required": true
            },
            "key": "moduleUrl",
            "type": "url",
            "input": true
          },
          {
            "label": "Description",
            "autoExpand": false,
            "tableView": true,
            "validate": {
                "required": true
            },
            "key": "description",
            "type": "textarea",
            "input": true
          },
          {
            "label": "Module Category",
            "widget": "html5",
            "tableView": true,
            "data": {
              "values": this.categories
            },
            "validate": {
                "required": true
            },
            "key": "moduleCategory",
            "type": "select",
            "input": true
          },
          {
            "label": "Proceed to Default Workflow",
            "showValidations": false,
            "customClass": "flex justify-end",
            "tableView": false,
            "key": "proceedToDefaultWorkflow",
            "type": "button",
            "input": true,
            "saveOnEnter": false,
            "disableOnInvalid": true
          }
        ]
      };
    });
    
    this.localStorageApp = getItem(StorageItem.publishAppValue);
    if(this.localStorageApp) {
      this.initWorkflowForm(this.localStorageApp);
      this.moduleData.next(this.localStorageApp);
      this.file = this.localStorageApp?.image
      this.prePopulatedDataDetails = {
        "data": {
          "moduleCategory": this.localStorageApp?.categoryId,
          "moduleTitle": this.localStorageApp?.title,
          "description": this.localStorageApp?.description,
          "moduleUrl": this.localStorageApp?.url
        }
      }
    }
    else {
      this.initWorkflowForm();
    }
  }

  initWorkflowForm(item?: any) {
    if(item?.defaultWorkflow) {
      this.workflowForm = this.fb.group({
        workflows: this.fb.array(
          item?.defaultWorkflow?.map((val: { condition: any; approverIds: any; }) => {
            return this.fb.group({
              condition: [val.condition, Validators.required],
              approverIds: [val.approverIds, Validators.required]
            })
          }))
        })
    }
    else {
      this.workflowForm = this.fb.group({
        workflows: this.fb.array([
          this.fb.group({
            condition: ['', Validators.required],
            approverIds: [[], Validators.required]
          })
        ])
      })
    }
  }

  get workflows() {
    return this.workflowForm.controls['workflows'] as FormArray
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

  getApproverList(value: string[], index: number) {
    this.workflows.at(index)?.get('approverIds')?.setValue(value);
  }

  nextStep(submission?: any): void {
    if(this.activeIndex !== 3) {
      switch(this.activeIndex) {
        case 0:
          const moduleDetails = {
            categoryId: submission?.data?.moduleCategory,
            title: submission?.data?.moduleTitle,
            description: submission?.data?.description,
            url: submission?.data?.moduleUrl
          }
          setItem(StorageItem.publishAppValue, moduleDetails)
          this.moduleData.next(moduleDetails);
          this.moveNext();
          break;
        case 1:
          if(this.workflows.controls.map(val => val.get('approverIds')?.value.length == 0).includes(true)) {
            return this.notif.displayNotification('Please complete the default workflow', 'Create Module', TuiNotification.Warning);
          }
          if(this.workflows.controls.map(val => val.get('condition')?.value).includes('') === true) {
            return this.notif.displayNotification('Please complete the default workflow', 'Create Module', TuiNotification.Warning);
          }
          const defaultFlow = this.workflows?.value?.map(data => {
            return {
              approverIds: data.approverIds?.map(approvers => {
                if(approvers?.id) {
                  return approvers?.id
                }
                return approvers
              }),
              condition: data?.condition
            }
          });
          console.log(defaultFlow)
          this.moduleData.next({...this.moduleData?.value, defaultWorkflow: defaultFlow});
          setItem(StorageItem.publishAppValue, this.moduleData?.value);
          this.moveNext()
          break;
        case 2:
          if(!this.file) {
            return this.notif.displayNotification('Please provide a valid icon for your app', 'Create Module', TuiNotification.Warning)
          }
          this.moduleData.next({...this.moduleData?.value, image: this.file});
          setItem(StorageItem.publishAppValue, this.moduleData?.value);
          this.submitNewModule()
          break;
        default:
          this.moveNext()
      }
    }
  }

  previousStep(): void {
    this.prePopulatedDataDetails = {
      "data": {
        "moduleCategory": this.moduleData?.value?.categoryId,
        "moduleTitle": this.moduleData?.value?.title,
        "description": this.moduleData?.value?.description,
        "moduleUrl": this.moduleData?.value?.url
      }
    }
    if(this.activeIndex !== 0)
    this.activeIndex--;
    setItem(StorageItem.activeIndex, this.activeIndex)
  }

  moveNext(): void {
    this.activeIndex++;
    setItem(StorageItem.activeIndex, this.activeIndex)
  }

  onFileSelect(event: any) {
    const file = event?.target?.files[0];
    // if(this.calculateFileSize(file) == true) {
    //   this.calculateAspectRatio(file).then((res) => {
    //     if(res == false) {
    //       this.notif.displayNotification('Image width and height should be 500px (1:1 aspect ratio)', 'File Upload', TuiNotification.Warning)
    //     }
    //     else {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = (e) => {
            this.file = reader.result;
          };
      //   }
      // });
    // }
    // else {
    //   this.notif.displayNotification('Allowed file types are JPG/PNG/WebP. File size cannot exceed 1MB', 'File Upload', TuiNotification.Warning)
    // }
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
    console.log(this.moduleData.value);
    this.dashboard.createModule(this.moduleData.value).pipe(takeUntil(this.destroy$)).subscribe()
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
