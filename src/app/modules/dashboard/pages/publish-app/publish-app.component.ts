import { Component, ElementRef, EventEmitter, OnDestroy, ViewChild } from '@angular/core';
import  { Subject, Observable, of, map, takeUntil, BehaviorSubject, take, first } from 'rxjs';
import { NotificationsService } from 'src/core/core-services/notifications.service';
import { setItem, StorageItem, getItem, removeItem } from 'src/core/utils/local-storage.utils';
import { TuiNotification } from '@taiga-ui/core';
import {TUI_ARROW} from '@taiga-ui/kit';
import { createModuleDetailsForm } from 'src/app/forms-schema/forms';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DashboardService } from '../../dashboard.service';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';

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

  workflowForm: FormGroup;

  public moduleDetailsForm: FormGroup;
  categoryDataForFormIOSelect = new BehaviorSubject<any>(null);
  isEditMode = new BehaviorSubject(false);
  storeModuleID = new BehaviorSubject<any>('');
  @ViewChild('btn') btn: ElementRef;

  constructor(
    private fb: FormBuilder,
    private notif: NotificationsService,
    private dashboard: DashboardService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
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
    });

    this.localStorageApp = getItem(StorageItem.publishAppValue);
    if(this.localStorageApp) {
      this.initWorkflowForm(this.localStorageApp);
      this.initModuleDetailsForm(this.localStorageApp);
      this.moduleData.next(this.localStorageApp);
      this.file = this.localStorageApp?.image;
    }
    else {
      this.initWorkflowForm();
      this.initModuleDetailsForm()
    }

    this.moduleDetailsForm?.get('moduleTitle')?.valueChanges.subscribe(value => {
      this.moduleDetailsForm?.get('moduleURL')?.setValue('https://depa-frontend.pages.dev/appListing/submodules/'+ value.replace(/\s/g, '-').toLowerCase());
      this.moduleDetailsForm?.get('moduleCode')?.setValue(value.replace(/\s/g, '-').toLowerCase())
    })

    // get all categories
    this.categories = this.dashboard.getAllCategories()
  }

  initModuleDetailsForm(item?: any) {
    this.moduleDetailsForm = this.fb.group({
      moduleTitle: [item?.title || null, Validators.required],
      moduleURL: [{value: item?.url || null, disabled: true}],
      moduleDescription: [item?.description || null, Validators.required],
      moduleCode: [{value: item?.code || null, disabled: true}],
      moduleCategory: [item?.categoryId?.value || null, Validators.required],
      category: this.fb.array([]),
    })
  }

  get category() {
    return this.f["category"] as FormArray;
  }

  addCategory() {
    const companyForm = this.fb.group({
      title: ['', Validators.required]
    });
    this.category.push(companyForm);
  }

  removeCategory(index: number) {
    this.category.removeAt(index);
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

  submitNewCategory() {
    const data = this.f['category']?.value?.map(val => {
      return {
        name: val.title
      }
    });
    this.dashboard.postNewCategory(data[0]).pipe(takeUntil(this.destroy$))
    .subscribe(res => {
      this.category.removeAt(0);
      this.categories = this.dashboard.getAllCategories();
    })
  }

  get f() {
    return this.moduleDetailsForm.controls
  }

  get workflows() {
    return this.workflowForm.controls['workflows'] as FormArray
  }

  addWorkflowStep() {
    const workflowStepForm = this.fb.group({
      approverIds: [[], Validators.required],
      condition: [{value: '', disabled: ''}, Validators.required],
    });
    this.workflows.push(workflowStepForm);
  }

  removeWorkflowStep(index: number) {
    this.workflows.removeAt(index);
  }

  getApproverList(value: string[], index: number) {
    this.workflows.at(index)?.get('approverIds')?.setValue(value);
  }

  countUsers(value: number, index: number) {
    if(value < 2) {
      this.workflows.at(index)?.get('condition')?.setValue('none')
      this.notif.displayNotification('Default condition of "None" will be used if the number of approvers is less than 2', 'Create Module', TuiNotification.Warning)
    }
    if(value >= 2) {
      this.notif.displayNotification('Please select either AND or OR as the condition', 'Create Module', TuiNotification.Warning)
      return this.btn.nativeElement.disabled = true
    }
    return this.btn.nativeElement.disabled = false
  }

  validateSelection(index: number) {
    if(this.workflows.at(index)?.get('approverIds')?.value?.length < 2) {
      this.workflows.at(index)?.get('condition')?.setValue('none')
      this.notif.displayNotification('Default condition of "None" will be used if the number of approvers is less than 2', 'Create Module', TuiNotification.Warning);
    }
    if(this.workflows.at(index)?.get('approverIds')?.value?.length >= 2 && this.workflows.at(index)?.get('condition')?.value == 'none') {
      this.notif.displayNotification('Please select either AND or OR as the condition', 'Create Module', TuiNotification.Warning)
      return this.btn.nativeElement.disabled = true
    }
    return this.btn.nativeElement.disabled = false
  }

  nextStep(submission?: any): void {
    if(this.activeIndex !== 3) {
      switch(this.activeIndex) {
        case 0:
          if(this.f['moduleTitle']?.invalid || this.f['moduleDescription']?.invalid || this.f['moduleCategory']?.invalid) {
            return this.notif.displayNotification('Please fill in all fields', 'Create Module', TuiNotification.Warning);
          }
          const moduleDetails = {
            categoryId: this.f['moduleCategory']?.value,
            title: this.f['moduleTitle']?.value,
            description: this.f['moduleDescription']?.value,
            url: this.f['moduleURL']?.value,
            code: this.f['moduleCode']?.value
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
            return this.notif.displayNotification('Please provide a valid image for your module', 'Create Module', TuiNotification.Warning)
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
            this.dashboard.moduleEditData.next(null)
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
            this.dashboard.moduleEditData.next(null)
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
