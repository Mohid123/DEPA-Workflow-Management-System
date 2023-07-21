import { Component, EventEmitter, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormioOptions } from '@formio/angular';
import { TuiDialogContext, TuiDialogService, TuiNotification } from '@taiga-ui/core';
import { BehaviorSubject, Subject, Subscription, switchMap, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/modules/auth/auth.service';
import { DashboardService } from 'src/app/modules/dashboard/dashboard.service';
import { DataTransportService } from 'src/core/core-services/data-transport.service';
import { NotificationsService } from 'src/core/core-services/notifications.service';
import { StorageItem, getItem } from 'src/core/utils/local-storage.utils';
import { PolymorpheusContent } from '@tinkoff/ng-polymorpheus';
import { CodeValidator, calculateAspectRatio, calculateFileSize } from 'src/core/utils/utility-functions';
import { MediaUploadService } from 'src/core/core-services/media-upload.service';
import { ApiResponse } from 'src/core/models/api-response.model';

@Component({
  templateUrl: './add-submodule.component.html',
  styleUrls: ['./add-submodule.component.scss']
})
export class AddSubmoduleComponent implements OnDestroy, OnInit {
  subModuleForm!: FormGroup;
  submoduleFromLS: any;
  formComponents: any[] = [];
  activeIndex: number = 0;
  public options: FormioOptions;
  public language: EventEmitter<string> = new EventEmitter();
  langItems = [{name: 'en',}, {name: 'ar'}];
  languageForm = new FormGroup({
    languages: new FormControl(this.langItems[0]),
  });

  readonly conditions = [
    'OR',
    'AND',
    'ANY'
  ];
  formTabs: any[] = [];
  subModuleFormIoValue = new BehaviorSubject<any>({});
  destroy$ = new Subject();
  isCreatingSubModule = new Subject<boolean>();
  redirectToModuleID: string;
  companyList: any[];
  categoryList: any[];
  domainURL = window.location.origin;
  currentFieldArray: any;
  activeEmailIndex: number;
  userListForEmail: any[] = [];
  private readonly search$ = new Subject<string>();
  saveDialogSubscription: Subscription[] = [];
  limit: number = 10;
  page: number = 0;
  showError = new Subject<boolean>();
  errorIndex: number = 0;
  file: any;
  base64File: any;
  previousUrl: string;
  currentUrl: string;
  returnToDashboard: boolean;
  parentID: string;
  parentIDUnAssigned: boolean = false;
  categoryId: string;
  categoryIdForMatch: string;

  constructor(
    private fb: FormBuilder,
    public auth: AuthService,
    public transportService: DataTransportService,
    private router: Router,
    private dashboard: DashboardService,
    private activatedRoute: ActivatedRoute,
    private notif: NotificationsService,
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
    private media: MediaUploadService
  ) {
    this.initSubModuleForm();
    this.submoduleFromLS = this.transportService.subModuleDraft.value;

    //get default workflow
    this.activatedRoute.queryParams.pipe(takeUntil(this.destroy$)).subscribe(val => {
      if(Object.keys(val).length > 0) {
        this.parentIDUnAssigned = true;
        this.getDefaultWorkflowByModule();
        this.getAllCategories();
        this.categoryIdForMatch = val['parentID'];
      }
      else {
        this.getDefaultWorkflowBySubModule();
      }
    })
    this.formComponents = this.transportService.formBuilderData.value;
    this.formTabs = this.formComponents.map(val => val.title);

    this.getAllCompanies();
    // get users for email

    this.search$.pipe(switchMap(search => this.dashboard.getAllUsersForListing(this.limit, this.page, search))).subscribe((res: any) => {
      if (res) {
        this.userListForEmail = res?.results?.map((data) => data?.email);
      }
    });

    this.dashboard.getAllUsersForListing(this.limit, this.page).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res) {
        this.userListForEmail = res?.results?.map((data) => data?.email);
      }
    });
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.pipe(takeUntil(this.destroy$)).subscribe(val => {
      if(Object.keys(val).length == 0) {
        const hierarchy = getItem(StorageItem.navHierarchy);
        hierarchy.forEach(val => {
          val.routerLink = `/modules/${val.caption}?moduleID=${getItem(StorageItem.moduleID)}`
        })
        this.dashboard.items = [...hierarchy, {
          caption: 'Add App',
          routerLink: `/modules/add-module/${getItem(StorageItem.moduleID)}`
        }];
      }
    })
  }

  getDefaultWorkflowByModule() {
    this.activatedRoute.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if(params['id']) {
        if(this.parentIDUnAssigned === false) {
          this.parentID = params['id']
        }
        this.redirectToModuleID = params['id'];
        this.transportService.moduleID.next(params['id']);
        if(Object.keys(this.submoduleFromLS)?.length > 0) {
          this.initSubModuleForm(this.submoduleFromLS);
          this.base64File = this.submoduleFromLS?.image;
          this.file = this.submoduleFromLS?.file
        }
      }
    });
  }

  getDefaultWorkflowBySubModule() {
    this.activatedRoute.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if(params['id']) {
        if(this.parentIDUnAssigned === false) {
          this.parentID = params['id']
        }
        this.redirectToModuleID = params['id'];
        this.transportService.moduleID.next(params['id']);
        this.dashboard.getWorkflowFromSubModule(params['id']).pipe(takeUntil(this.destroy$))
        .subscribe((res: any) => {
          if(res) {
            this.categoryId = res?.categoryId;
            this.initSubModuleForm(res?.response);
          }
          if(Object.keys(this.submoduleFromLS)?.length > 0) {
            this.initSubModuleForm(this.submoduleFromLS);
            this.base64File = this.submoduleFromLS?.image
            this.file = this.submoduleFromLS?.file
          }
        })
      }
    });
  }

  // email notify functions

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

  getAllCompanies() {
    this.dashboard.getAllCompanies(10, 0)
    .pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      this.companyList = res.results?.map(data => {
        return {
          value: data?.id,
          label: data?.title
        }
      });
    });
  }

  getAllCategories() {
    this.dashboard.getAllCategories(10)
    .pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      this.categoryList = res.results?.map(data => {
        return {
          value: data?.id,
          label: data?.name
        }
      });
      let copyCat: any = this.categoryList;
      copyCat = copyCat?.filter(data => data?.value == this.categoryIdForMatch)[0];
      let prevVal = this.subModuleForm?.get('categoryName')?.value;
      if(!prevVal) {
        this.subModuleForm?.get('categoryName')?.setValue(copyCat?.value)
      }
    });
  }

  initSubModuleForm(item?: any) {
    this.subModuleForm = this.fb.group({
      companies: this.fb.array([]),
      categories: this.fb.array([]),
      code: [{value: item?.code, disabled: true} || {value: null, disabled: true}],
      companyName: [item?.companyName || null, Validators.required],
      categoryName: [item?.categoryName || null, Validators.required],
      adminUsers: [item?.adminUsers || [], Validators.required],
      viewOnlyUsers: [item?.viewOnlyUsers || [], Validators.required],
      title: [item?.title || null, Validators.compose([Validators.required]), [CodeValidator.createValidator(this.dashboard)]],
      image: [item?.image || null, Validators.required],
      description: [item?.description || null, Validators.required],
      workflows: this.fb.array(
        item?.workflows ?
        item?.workflows?.map((val: { condition: any; emailNotifyTo: any; approverIds: any; }) => {
          return this.fb.group({
            condition: [val.condition, Validators.required],
            approverIds: [val.approverIds, Validators.required],
            emailNotifyTo: [val.emailNotifyTo || [], Validators.required]
          })
        }) :
        item?.map((val: { condition: any; emailNotifyTo: any; approverIds: any; }) => {
          return this.fb.group({
            condition: [val.condition, Validators.required],
            approverIds: [val.approverIds, Validators.required],
            emailNotifyTo: [val.emailNotifyTo || [], Validators.required]
          })
        })
        ||
        [
          this.fb.group({
            condition: [null, Validators.required],
            approverIds: [[], Validators.required],
            emailNotifyTo: [[], Validators.required]
          })
        ]
      )
    })
  }

  onFileSelect(event: any) {
    const file = event?.target?.files[0];
    if(calculateFileSize(file) == true) {
      this.file = file;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
          this.base64File = reader.result;
        };
      }
    //   calculateAspectRatio(file).then((res) => {
    //     if(res == false) {
    //       this.notif.displayNotification('Image should be of 1:1 aspect ratio', 'File Upload', TuiNotification.Warning)
    //     }
    //     else {
    //       this.file = file;
    //       const reader = new FileReader();
    //       reader.readAsDataURL(file);
    //       reader.onload = (e) => {
    //         this.base64File = reader.result;
    //       };
    //     }
    //   });
    // }
    else {
      this.notif.displayNotification('Allowed file types are JPG/PNG/WebP. File size cannot exceed 2MB', 'File Upload', TuiNotification.Warning)
    }
  }

  get f() {
    return this.subModuleForm.controls
  }

  get companies() {
    return this.f["companies"] as FormArray;
  }

  addCompany() {
    const companyForm = this.fb.group({
      title: ['', Validators.required]
    });
    this.companies.push(companyForm)
  }

  removeCompany(index: number) {
    this.companies.removeAt(index);
  }

  get categories() {
    return this.f["categories"] as FormArray;
  }

  addCategory() {
    const categoryForm = this.fb.group({
      name: ['', Validators.required]
    });
    this.categories.push(categoryForm)
  }

  removeCategory(index: number) {
    this.categories.removeAt(index);
  }

  get workflows() {
    return this.f['workflows'] as FormArray
  }

  addWorkflowStep() {
    const workflowStepForm = this.fb.group({
      condition: ['', Validators.required],
      approverIds: [[], Validators.required],
      emailNotifyTo: [[], Validators.required]
    });
    this.workflows.push(workflowStepForm)
  }

  removeWorkflowStep(index: number) {
    this.workflows.removeAt(index);
  }

  getApproverList(value: string[], index: number) {
    this.workflows.at(index)?.get('approverIds')?.setValue(value);
  }

  submitNewCompany() {
    const payload: any = {
      title: this.f["companies"]?.value[0]?.title,
      groupCode: this.f["companies"]?.value[0]?.title.replace(/\s/g, '-')
    }
    this.dashboard.addCompany(payload).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if(res) {
        this.companies.reset();
        this.companies.removeAt(0);
        this.getAllCompanies();
      }
    })
  }

  submitNewCategory() {
    const payload: any = {
      name: this.f["categories"]?.value[0]?.name
    }
    this.dashboard.addCategory(payload).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if(res) {
        this.categories.reset();
        this.categories.removeAt(0);
        this.getAllCategories();
      }
    })
  }

  saveDraft() {
    this.transportService.isFormEdit.next(false);
    this.transportService.saveDraftLocally({...this.subModuleForm.value, image: this.base64File, file: this.file});
    this.router.navigate(['/forms/form-builder']);
  }

  sendFormForEdit(index: number) {
    this.transportService.isFormEdit.next(true);
    this.transportService.sendFormDataForEdit.next(this.formComponents[index]);
    this.transportService.saveDraftLocally({...this.subModuleForm.value, image: this.base64File, file: this.file});
    this.router.navigate(['/forms/form-builder']);
  }

  changeLanguage(lang: string) {
    this.language.emit(lang);
  }

  saveSubModule(statusStr?: number) {
    if(this.dataSubmitValidation() == false) {
      this.subModuleForm.markAllAsTouched();
      return this.notif.displayNotification('Please provide complete data for all fields', 'Create module', TuiNotification.Warning)
    }
    if(this.workflows.controls.map(val => val.get('approverIds')?.value.length > 1 && val.get('condition')?.value).includes('none')) {
      return this.notif.displayNotification('Please provide valid condition for the workflow step/s', 'Create module', TuiNotification.Warning)
    }
    let payload: any = {
      title: this.subModuleForm.get('title')?.value,
      description: this.subModuleForm.get('description')?.value,
      url: `/modules/module-details/${this.subModuleForm.get('title')?.value.replace(/\s/g, '-').toLowerCase()}`,
      companyId: this.subModuleForm.get('companyName')?.value,
      categoryId: this.subModuleForm.get('categoryName')?.value ? this.subModuleForm.get('categoryName')?.value : this.categoryId,
      code: this.subModuleForm.get('title')?.value.replace(/\s/g, '-').toLowerCase(),
      adminUsers: this.subModuleForm.get('adminUsers')?.value?.map(data => data?.id),
      viewOnlyUsers: this.subModuleForm.get('viewOnlyUsers')?.value?.map(data => data?.id),
      formIds: this.formComponents,
      parentId: this.parentIDUnAssigned === true ? undefined : this.parentID,
      createdBy: this.auth.currentUserValue?.id,
      steps: this.workflows?.value?.map(data => {
        return {
          approverIds: data?.approverIds?.map(ids => ids.id ? ids.id : ids),
          condition: data?.condition,
          emailNotifyTo: data?.emailNotifyTo || []
        }
      })
    }
    this.isCreatingSubModule.next(true);
    this.media.uploadMedia(this.file).pipe(takeUntil(this.destroy$)).subscribe((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        payload = {...payload, image: res?.data?.fileUrl };
        if(statusStr) {
          const status = statusStr;
          Object.assign(payload, {status})
        }
        this.dashboard.createSubModule(payload).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
          if(res) {
            this.isCreatingSubModule.next(false);
            this.transportService.saveDraftLocally({});
            this.transportService.sendFormBuilderData([{title: '', key: '', display: '', components: []}]);
            this.routeToBasedOnPreviousPage()
          }
          else {
            this.isCreatingSubModule.next(false);
          }
        })
      }
    })
  }

  routeToBasedOnPreviousPage() {
    this.activatedRoute.queryParams.pipe(takeUntil(this.destroy$)).subscribe(val => {
      if(Object.keys(val).length > 0) {
        this.router.navigate(['/dashboard/home'])
      }
      else {
        this.router.navigate(['/modules', getItem(StorageItem.moduleSlug) || ''], {queryParams: {moduleID: getItem(StorageItem.moduleID) || ''}});
      }
    })
  }

  cancelSubmodule() {
    this.routeToBasedOnPreviousPage()
  }

  dataSubmitValidation() {
    if(
      this.f['companyName']?.invalid ||
      this.workflows?.length == 0 ||
      this.workflows.controls.map(val => val.get('approverIds')?.value.length == 0).includes(true) ||
      this.workflows.controls.map(val => val.get('condition')?.value).includes('') === true ||
      Object.values(this.formComponents)[0]?.components?.length == 0
    ) {
      return false
    }
    return true
  }

  validateSelection(index: number) {
    this.errorIndex = index;
    if(this.workflows.at(index)?.get('approverIds')?.value?.length < 2) {
      this.workflows.at(index)?.get('condition')?.setValue('none');
      this.notif.displayNotification('Default condition of "None" will be used if the number of approvers is less than 2', 'Create module', TuiNotification.Info)
      return this.showError.next(false)
    }
    if(this.workflows.at(index)?.get('approverIds')?.value?.length >= 2 && this.workflows.at(index)?.get('condition')?.value == 'none') {
      return this.showError.next(true)
    }
    this.showError.next(false)
  }

  countUsers(value: number, index: number) {
    this.errorIndex = index;
    if(value < 2) {
      this.workflows.at(index)?.get('condition')?.setValue('none');
      this.notif.displayNotification('Default condition of "None" will be used if the number of approvers is less than 2', 'Create Module', TuiNotification.Info)
      return this.showError.next(false)
    }
    if(value >= 2 && this.workflows.at(index)?.get('condition')?.value == 'none') {
      return this.showError.next(true)
    }
    this.showError.next(false)
  }

  setAdminUsers(users: string[]) {
    this.subModuleForm?.get('adminUsers')?.setValue(users)
  }

  setViewUsers(users: string[]) {
    this.subModuleForm?.get('viewOnlyUsers')?.setValue(users)
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe()
  }
}
