import { Component, EventEmitter, OnDestroy } from '@angular/core';
import  { Subject, Observable, of, map, takeUntil, BehaviorSubject, take, first } from 'rxjs';
import { NotificationsService } from 'src/core/core-services/notifications.service';
import { setItem, StorageItem, getItem, removeItem } from 'src/core/utils/local-storage.utils';
import { TuiNotification } from '@taiga-ui/core';
import {TUI_ARROW} from '@taiga-ui/kit';
import { createModuleDetailsForm } from 'src/app/forms/forms';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DashboardService } from '../../dashboard.service';
import { ActivatedRoute, Router } from '@angular/router';

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

  categories: any;
  isCreatingModule = new Subject<boolean>();

  options: any = {
    "disableAlerts": true
  };

  prePopulatedDataDetails: any;
  workflowForm: FormGroup;

  public moduleDetailsForm: any = createModuleDetailsForm;
  categoryDataForFormIOSelect = new BehaviorSubject<any>(null);
  isEditMode = new BehaviorSubject(false);
  storeModuleID = new BehaviorSubject<any>('')

  constructor(
    private fb: FormBuilder,
    private notif: NotificationsService,
    private dashboard: DashboardService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
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
            "label": "Code",
            "tableView": true,
            "validate": {
                "required": true
            },
            "key": "code",
            "type": "textfield",
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

    //edit module case
    this.dashboard.moduleEditData.pipe(takeUntil(this.destroy$), take(1)).subscribe(val => {
      if(val) {
        const category = {
          value: val.categoryId?.id,
          label: val.categoryId?.name
        };
        const stepsArr = val?.workFlowId?.stepIds?.map(data => {
          return {
            id: data?.id,
            approverIds: data?.approverIds?.map(ids => ids.id),
            condition: data?.condition
          }
        });
        const workFlow = val?.workFlowId?.id;
        this.activatedRoute.queryParams.pipe(takeUntil(this.destroy$)).subscribe(val => {
          this.storeModuleID.next(val['id'])
        })
        const editableValue = Object.assign(val, {categoryId: category, workFlowId: workFlow, steps: stepsArr});
        setItem(StorageItem.publishAppValue, editableValue);
        this.isEditMode.next(true);
      }
    })
    
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
          "moduleUrl": this.localStorageApp?.url,
          "code": this.localStorageApp?.code
        }
      }
    }
    else {
      this.initWorkflowForm();
    }
  }

  initWorkflowForm(item?: any) {
    if(item?.steps) {
      this.workflowForm = this.fb.group({
        workflows: this.fb.array(
          item?.steps?.map((val: { condition: any; approverIds: any; id?: any }) => {
            return this.fb.group({
              condition: [val.condition, Validators.required],
              approverIds: [val.approverIds, Validators.required],
              id: [val.id || undefined]
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
            url: submission?.data?.moduleUrl,
            code: submission?.data?.code
          }
          if(this.isEditMode.value == true) {
            const catId = this.localStorageApp?.categoryId?.value;
            const workFlowId = this.localStorageApp?.workFlowId;
            const steps = this.localStorageApp?.steps;
            Object.assign(moduleDetails, {workFlowId, categoryId: catId, steps})
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
          if(this.isEditMode.value == false) {
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
            this.moduleData.next({...this.moduleData?.value, steps: defaultFlow});
          }
          else {
            const newSteps = this.workflows?.value?.map(data => {
              return {
                approverIds: data.approverIds?.map(approvers => {
                  if(approvers?.id) {
                    return approvers?.id
                  }
                  return approvers
                }),
                condition: data?.condition,
                id: data?.id || undefined
              }
            });
            const defaultFlow = newSteps;
            this.moduleData.next({...this.moduleData?.value, steps: defaultFlow});
          }
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
        "moduleUrl": this.moduleData?.value?.url,
        "code": this.localStorageApp?.code
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
            this.file = 'https://images.pexels.com/photos/2381463/pexels-photo-2381463.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
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
    if(this.isEditMode.value == false) {
      this.isCreatingModule = this.dashboard.creatingModule;
      this.dashboard.createModule(this.moduleData.value).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
        if(res) {
          this.moveNext();
          setTimeout(() => {
            removeItem(StorageItem.publishAppValue);
            removeItem(StorageItem.activeIndex);
            this.router.navigate(['/dashboard/home'])
          }, 1400)
        }
      })
    }
    else {
      this.isCreatingModule = this.dashboard.creatingModule;
      this.dashboard.editModule(this.storeModuleID?.value, this.moduleData.value)
      .pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
        if(res) {
          this.moveNext();
          setTimeout(() => {
            removeItem(StorageItem.publishAppValue);
            removeItem(StorageItem.activeIndex);
            this.router.navigate(['/dashboard/home'])
          }, 1400)
        }
      })
    }
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
