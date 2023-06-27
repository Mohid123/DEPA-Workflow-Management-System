import {
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import {
  Subject,
  Observable,
  of,
  takeUntil,
  BehaviorSubject,
  take,
  switchMap,
  Subscription,
} from 'rxjs';
import { NotificationsService } from 'src/core/core-services/notifications.service';
import {
  setItem,
  StorageItem,
  getItem,
  removeItem,
} from 'src/core/utils/local-storage.utils';
import {
  TuiDialogContext,
  TuiDialogService,
  TuiNotification,
} from '@taiga-ui/core';
import { TUI_ARROW } from '@taiga-ui/kit';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { DashboardService } from '../../dashboard.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PolymorpheusContent } from '@tinkoff/ng-polymorpheus';
import { MediaUploadService } from 'src/core/core-services/media-upload.service';
import { ApiResponse } from 'src/core/models/api-response.model';
import { calculateAspectRatio, calculateFileSize } from 'src/core/utils/utility-functions';

@Component({
  templateUrl: './publish-app.component.html',
  styleUrls: ['./publish-app.component.scss'],
})
export class PublishAppComponent implements OnDestroy {
  destroy$ = new Subject();
  file: any;
  base64File: any;
  localStorageApp: any;
  appNameLength: Observable<number> = of(0);
  activeIndex: number = getItem(StorageItem.activeIndex) || 0;
  moduleData = new BehaviorSubject<any>({});
  refreshForm = new EventEmitter();
  readonly arrow = TUI_ARROW;
  readonly tabs = [
    {
      text: 'Module Details',
    },
    {
      text: 'Default Workflow',
    },
    {
      text: 'Module Graphics',
    },
    {
      text: 'Published',
    },
  ];
  readonly categoryOptions = [
    'Human Resources',
    'Networking',
    'Games',
    'E-Commerce',
    'Finance',
    'Management',
  ];
  readonly conditions = ['OR', 'AND', 'ANY'];

  categories: Observable<any>;
  isCreatingModule = new Subject<boolean>();
  limit: number = 10;
  page: number = 0;
  workflowForm: FormGroup;
  public moduleDetailsForm: FormGroup;
  categoryDataForFormIOSelect = new BehaviorSubject<any>(null);
  isEditMode = new BehaviorSubject(false);
  storeModuleID = new BehaviorSubject<any>('');
  @ViewChild('btn') btn: ElementRef;
  currentFieldArray: any;
  activeEmailIndex: number;
  userListForEmail: any[] = [];
  private readonly search$ = new Subject<string>();
  saveDialogSubscription: Subscription[] = [];
  showError = new Subject<boolean>();
  errorIndex: number = 0;

  constructor(
    private fb: FormBuilder,
    private notif: NotificationsService,
    private dashboard: DashboardService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private media: MediaUploadService,
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService
  ) {
    //edit module case
    this.dashboard.moduleEditData
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe((val) => {
        if (val) {
          const category = {
            value: val.categoryId?.id,
            label: val.categoryId?.name,
          };
          const stepsArr = val?.workFlowId?.stepIds?.map((data) => {
            
            return {
              id: data?.id,
              approverIds: data?.approverIds?.map((ids) => {
                return {
                  name: ids?.fullName,
                  id: ids?.id,
                  control: new FormControl<boolean>(true)
                }
              }),
              emailNotifyTo: data?.emailNotifyToId?.notifyUsers || [],
              condition: data?.condition,
              emailNotifyToId: data?.emailNotifyToId?.id
            };
          });
          const workFlow = val?.workFlowId?.id;
          this.activatedRoute.queryParams
            .pipe(takeUntil(this.destroy$))
            .subscribe((val) => {
              this.storeModuleID.next(val['id']);
          });
          this.base64File = val?.image;
          this.file = val?.image;
          const url = `${window.location.origin}${val?.url}`;
          const editableValue = Object.assign(val, {
            categoryId: category,
            workFlowId: workFlow,
            steps: stepsArr,
            url: url
          });
          setItem(StorageItem.publishAppValue, editableValue);
          this.isEditMode.next(true);
        }
      });

    this.localStorageApp = getItem(StorageItem.publishAppValue);
    if (this.localStorageApp) {
      this.initWorkflowForm(this.localStorageApp);
      this.initModuleDetailsForm(this.localStorageApp);
      this.moduleData.next(this.localStorageApp);
      this.file = this.localStorageApp?.image;
      this.base64File = this.localStorageApp?.image;
    } else {
      this.initWorkflowForm();
      this.initModuleDetailsForm();
    }

    this.moduleDetailsForm
      ?.get('moduleTitle')
      ?.valueChanges.subscribe((value) => {
        this.moduleDetailsForm
          ?.get('moduleURL')
          ?.setValue(
            `${window.location.origin}/submodule/submodules-list/` +
              value.replace(/\s/g, '-').toLowerCase()
          );
        this.moduleDetailsForm
          ?.get('moduleCode')
          ?.setValue(value.replace(/\s/g, '-').toLowerCase());
      });

    // get all categories
    this.categories = this.dashboard.getAllCategories(this.limit, this.page);

    // searchUsers
    this.search$.pipe(
      switchMap(search =>
        this.dashboard
          .getAllUsersForListing(this.limit, this.page, search)
      )
    ).subscribe((res: any) => {
      if (res) {
        this.userListForEmail = res?.results?.map((data) => data?.email);
      }
    });

    // get users for email search
    this.dashboard
      .getAllUsersForListing(this.limit, this.page)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          this.userListForEmail = res?.results?.map((data) => data?.email);
        }
      });
  }

  onSearchChange(search: string) {
    this.search$.next(search);
  }

  validateEmails() {
    let emails = this.workflows.at(this.activeEmailIndex)?.get('emailNotifyTo')?.value;
    emails = emails.map(element => {
      if(!/\S+@\S+\.\S+/.test(element)) {
        return false
      }
      return true
    });
    if(emails.includes(false)) {
      this.notif.displayNotification('Please provide valid email addresses', 'Email Notify', TuiNotification.Warning)
    }
    else {
      this.saveDialogSubscription.forEach(val => val.unsubscribe())
    }
  }

  cancelEmailNotify() {
    this.workflows.at(this.activeEmailIndex)?.get('emailNotifyTo')?.setValue([]);
    this.saveDialogSubscription.forEach(val => val.unsubscribe())
  }

  initModuleDetailsForm(item?: any) {
    this.moduleDetailsForm = this.fb.group({
      moduleTitle: [item?.title || null, Validators.required],
      moduleURL: [{ value: item?.url || null, disabled: true }],
      moduleDescription: [item?.description || null, Validators.required],
      moduleCode: [{ value: item?.code || null, disabled: true }],
      moduleCategory: [item?.categoryId?.value || null, Validators.required],
      category: this.fb.array([]),
    });
  }

  get category() {
    return this.f['category'] as FormArray;
  }

  addCategory() {
    const companyForm = this.fb.group({
      title: ['', Validators.required],
    });
    this.category.push(companyForm);
  }

  removeCategory(index: number) {
    this.category.removeAt(index);
  }

  initWorkflowForm(item?: any) {
    if (item?.steps) {
      this.workflowForm = this.fb.group({
        workflows: this.fb.array(
          item?.steps?.map(
            (val: {
              condition: any;
              approverIds: any;
              emailNotifyTo: any;
              emailNotifyToId?: any;
              id?: any;
            }) => {
              return this.fb.group({
                condition: [val.condition, Validators.required],
                approverIds: [val.approverIds, Validators.required],
                emailNotifyTo: [val.emailNotifyTo || [], Validators.required],
                emailNotifyToId: [val.emailNotifyToId || undefined],
                id: [val.id || undefined],
              });
            }
          )
        ),
      });
    } else {
      this.workflowForm = this.fb.group({
        workflows: this.fb.array([
          this.fb.group({
            condition: ['', Validators.required],
            approverIds: [[], Validators.required],
            emailNotifyTo: [[], Validators.required],
          }),
        ]),
      });
    }
  }

  submitNewCategory() {
    const data = this.f['category']?.value?.map((val) => {
      return {
        name: val.title,
      };
    });
    this.dashboard
      .postNewCategory(data[0])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.category.removeAt(0);
        this.categories = this.dashboard.getAllCategories(
          this.limit,
          this.page
        );
      });
  }

  get f() {
    return this.moduleDetailsForm.controls;
  }

  get workflows() {
    return this.workflowForm.controls['workflows'] as FormArray;
  }

  addWorkflowStep() {
    const workflowStepForm = this.fb.group({
      condition: ['', Validators.required],
      approverIds: [[], Validators.required],
      emailNotifyTo: [[], Validators.required],
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
    this.errorIndex = index
    if (value < 2) {
      this.workflows.at(index)?.get('condition')?.setValue('none');
      this.notif.displayNotification(
        'Default condition of "None" will be used if the number of approvers is less than 2',
        'Create Module',
        TuiNotification.Info
      );
    }
    if (
      value >= 2 &&
      this.workflows.at(index)?.get('condition')?.value == 'none'
    ) {
      this.showError.next(true)
      return (this.btn.nativeElement.disabled = true);
    }
    this.showError.next(false)
    return (this.btn.nativeElement.disabled = false);
  }

  validateSelection(index: number) {
    this.errorIndex = index
    if (this.workflows.at(index)?.get('approverIds')?.value?.length < 2) {
      this.workflows.at(index)?.get('condition')?.setValue('none');
      this.notif.displayNotification(
        'Default condition of "None" will be used if the number of approvers is less than 2',
        'Create Module',
        TuiNotification.Info
      );
    }
    if (
      this.workflows.at(index)?.get('approverIds')?.value?.length >= 2 &&
      this.workflows.at(index)?.get('condition')?.value == 'none'
    ) {
      this.showError.next(true)
      return (this.btn.nativeElement.disabled = true);
    }
    this.showError.next(false)
    return (this.btn.nativeElement.disabled = false);
  }

  openEmailNotifyModal(
    content: PolymorpheusContent<TuiDialogContext>,
    fieldArray: FormArray,
    index: number
  ): void {
    this.activeEmailIndex = index;
    this.currentFieldArray = fieldArray;
    this.saveDialogSubscription.push(this.dialogs
      .open(content, {
        dismissible: false,
        closeable: false,
      })
      .subscribe());
  }

  nextStep(submission?: any): void {
    if (this.activeIndex !== 3) {
      switch (this.activeIndex) {
        case 0:
          if (
            this.f['moduleTitle']?.invalid ||
            this.f['moduleDescription']?.invalid ||
            this.f['moduleCategory']?.invalid
          ) {
            return this.notif.displayNotification(
              'Please fill in all fields',
              'Create Module',
              TuiNotification.Warning
            );
          }
          const moduleDetails = {
            categoryId: this.f['moduleCategory']?.value,
            title: this.f['moduleTitle']?.value,
            description: this.f['moduleDescription']?.value,
            url: this.f['moduleURL']?.value,
            code: this.f['moduleCode']?.value,
          };
          if (this.isEditMode.value == true) {
            const catId = this.localStorageApp?.categoryId?.value;
            const workFlowId = this.localStorageApp?.workFlowId;
            const steps = this.localStorageApp?.steps;
            Object.assign(moduleDetails, {
              workFlowId,
              categoryId: catId,
              steps,
            });
          }
          setItem(StorageItem.publishAppValue, moduleDetails);
          this.moduleData.next(moduleDetails);
          this.moveNext();
          break;
        case 1:
          if (this.workflows?.length == 0) {
            return this.notif.displayNotification(
              'Please complete the default workflow',
              'Create Module',
              TuiNotification.Warning
            );
          }
          if (
            this.workflows.controls
              .map((val) => val.get('approverIds')?.value.length == 0)
              .includes(true)
          ) {
            return this.notif.displayNotification(
              'Please complete the default workflow',
              'Create Module',
              TuiNotification.Warning
            );
          }
          if (
            this.workflows.controls
              .map((val) => val.get('condition')?.value)
              .includes('') === true
          ) {
            return this.notif.displayNotification(
              'Please complete the default workflow',
              'Create Module',
              TuiNotification.Warning
            );
          }
          if (this.isEditMode.value == false) {
            const defaultFlow = this.workflows?.value?.map((data) => {
              return {
                approverIds: data?.approverIds?.map((ids) =>
                  ids.id ? ids.id : ids
                ),
                condition: data?.condition,
                emailNotifyTo: data?.emailNotifyTo,
              };
            });
            this.moduleData.next({
              ...this.moduleData?.value,
              steps: defaultFlow,
            });
          } else {
            const newSteps = this.workflows?.value?.map((data) => {
              return {
                approverIds: data?.approverIds?.map((ids) =>
                  ids.id ? ids.id : ids
                ),
                condition: data?.condition,
                emailNotifyTo: data?.emailNotifyTo,
                id: data?.id ? data?.id : undefined,
                emailNotifyToId: data?.emailNotifyToId ? data?.emailNotifyToId : undefined,
              };
            });
            const defaultFlow = newSteps;
            this.moduleData.next({
              ...this.moduleData?.value,
              steps: defaultFlow,
            });
          }
          setItem(StorageItem.publishAppValue, this.moduleData?.value);
          this.moveNext();
          break;
        case 2:
          if (!this.file) {
            debugger
            return this.notif.displayNotification(
              'Please provide a valid image for your module',
              'Create Module',
              TuiNotification.Warning
            );
          }
          this.moduleData.next({ ...this.moduleData?.value, image: this.base64File });
          setItem(StorageItem.publishAppValue, this.moduleData?.value);
          this.submitNewModule();
          break;
        default:
          this.moveNext();
      }
    }
  }

  previousStep(): void {
    if (this.activeIndex !== 0) this.activeIndex--;
    setItem(StorageItem.activeIndex, this.activeIndex);
  }

  moveNext(): void {
    this.activeIndex++;
    setItem(StorageItem.activeIndex, this.activeIndex);
  }

  onFileSelect(event: any) {
    const file = event?.target?.files[0];
    if(calculateFileSize(file) == true) {
       calculateAspectRatio(file).then((res) => {
        if(res == false) {
          this.notif.displayNotification('Image should be of 1:1 aspect ratio', 'File Upload', TuiNotification.Warning)
        }
        else {
          this.file = file;
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = (e) => {
            this.base64File = reader.result;
          };
        }
      });
    }
    else {
      this.notif.displayNotification('Allowed file types are JPG/PNG/WebP. File size cannot exceed 2MB', 'File Upload', TuiNotification.Warning)
    }
  }

  submitNewModule() {
    this.isCreatingModule.next(true);
    const moduleURL = this.f['moduleURL']?.value.split(window.location.origin).pop();
    let payload = { ...this.moduleData.value, url: moduleURL };
    if (this.isEditMode.value == false) {
      this.media.uploadMedia(this.file).pipe(takeUntil(this.destroy$)).subscribe((res: ApiResponse<any>) => {
        if(!res.hasErrors()) {
          payload = {...payload, image: res?.data?.imageUrl };
          this.dashboard.createModule(payload)
          .pipe(takeUntil(this.destroy$))
          .subscribe((res: any) => {
            if (res) {
              this.moveNext();
              setTimeout(() => {
                removeItem(StorageItem.publishAppValue);
                removeItem(StorageItem.activeIndex);
                this.dashboard.moduleEditData.next(null);
                this.router.navigate(['/dashboard/home']);
              }, 1400);
            }
          });
        }
      })
    }
    else {
      if(typeof this.file == 'string') {
        const url = 'uploads' + payload?.image.split('uploads')[1];
        payload = {...payload, image: url };
        this.dashboard.editModule(this.storeModuleID?.value, payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe((res: any) => {
          if (res) {
            this.moveNext();
            setTimeout(() => {
              removeItem(StorageItem.publishAppValue);
              removeItem(StorageItem.activeIndex);
              this.dashboard.moduleEditData.next(null);
              this.router.navigate(['/dashboard/home']);
            }, 1400);
          }
        });
      }
      else {
        this.media.uploadMedia(this.file).pipe(takeUntil(this.destroy$)).subscribe((res: ApiResponse<any>) => {
          if(!res.hasErrors()) {
            payload = {...payload, image: res?.data?.imageUrl };  
            this.dashboard.editModule(this.storeModuleID?.value, payload)
            .pipe(takeUntil(this.destroy$))
            .subscribe((res: any) => {
              if (res) {
                this.moveNext();
                setTimeout(() => {
                  removeItem(StorageItem.publishAppValue);
                  removeItem(StorageItem.activeIndex);
                  this.dashboard.moduleEditData.next(null);
                  this.router.navigate(['/dashboard/home']);
                }, 1400);
              }
            });
          }
        })
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
