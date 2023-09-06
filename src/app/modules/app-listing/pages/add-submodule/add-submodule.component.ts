import { Component, EventEmitter, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormioForm, FormioOptions, FormioUtils } from '@formio/angular';
import { TuiDialogContext, TuiDialogService, TuiNotification } from '@taiga-ui/core';
import { BehaviorSubject, Observable, Subject, Subscription, forkJoin, switchMap, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/modules/auth/auth.service';
import { DashboardService } from 'src/app/modules/dashboard/dashboard.service';
import { DataTransportService } from 'src/core/core-services/data-transport.service';
import { NotificationsService } from 'src/core/core-services/notifications.service';
import { StorageItem, getItem, setItem } from 'src/core/utils/local-storage.utils';
import { PolymorpheusContent } from '@tinkoff/ng-polymorpheus';
import { CodeValidator, calculateFileSize, generateKeyCombinations } from 'src/core/utils/utility-functions';
import { MediaUploadService } from 'src/core/core-services/media-upload.service';
import { ApiResponse } from 'src/core/models/api-response.model';

@Component({
  templateUrl: './add-submodule.component.html',
  styleUrls: ['./add-submodule.component.scss']
})
export class AddSubmoduleComponent implements OnDestroy, OnInit {
  subModuleForm!: FormGroup;
  submoduleFromLS: any;
  formKeys: any[] = [];
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
  isSavingAsDraft = new Subject<boolean>();
  redirectToModuleID: string;
  companyList: any[];
  categoryList: any[];
  domainURL = window.location.origin;
  currentFieldArray: any;
  activeEmailIndex: number;
  userListForEmail: any[] = [];
  private readonly search$ = new Subject<string>();
  saveDialogSubscription: Subscription[] = [];
  schemaSubscription: Subscription[] = [];
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
  items = [{name: 'anyCreate'}, {name: 'anyCreateAndModify'}, {name: 'disabled'}];
  selectItems = ['Text', 'Number', 'Date'];
  accessTypeValue: FormControl;
  paramID: string
  formKeysForViewSchema: any[] = [];
  summarySchemaFields: any[] = [];
  schemaForm = new FormGroup({
    summarySchema: new FormControl([]),
    viewSchema: new FormArray([
      new FormGroup({
        fieldKey: new FormControl(''),
        displayAs: new FormControl(''),
        type: new FormControl(this.selectItems[0])
      })
    ])
  });
  delIndex: number;
  formForDefaultData: FormioForm;
  deafultFormSubmission: any[] = [];
  defaultFormIndex: number;
  defaultFormSubscription: Subscription[] = [];

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
    this.accessTypeValue = new FormControl(this.items[2])
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
    let formComps = JSON.parse(JSON.stringify(this.formComponents));
    formComps?.map(form => {
      this.formKeys?.push({[form.key]: FormioUtils.flattenComponents(form?.components, true)})
    })
    this.summarySchemaFields = this.formKeys.flatMap(val => {
      let res = generateKeyCombinations(val)
      return res
    })
    this.formKeysForViewSchema = this.summarySchemaFields;

    this.getAllCompanies();
    // get users for email

    this.search$.pipe(
      switchMap(search => this.dashboard.getAllUsersForListing(this.limit, this.page, search)),
      takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if (res) {
        this.userListForEmail = res?.results?.map((data) => data?.email);
      }
    });

    this.dashboard.getAllUsersForListing(this.limit, this.page)
    .pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res) {
        this.userListForEmail = res?.results?.map((data) => data?.email);
      }
    });
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.pipe(takeUntil(this.destroy$)).subscribe(val => {
      if(Object.keys(val).length == 0) {
        const hierarchy = getItem(StorageItem.navHierarchy);
        if(hierarchy && this.dashboard.previousRoute && !this.dashboard.previousRoute.includes('isParent')) {
          hierarchy.forEach(val => {
            val.routerLink = `/modules/${val.code}?moduleID=${getItem(StorageItem.moduleID)}`
          })
          this.dashboard.items = [...hierarchy, {
            caption: this.transportService?.subModuleDraft?.value?.title || 'Add App',
            routerLink: `/modules/add-module/${getItem(StorageItem.moduleID)}`
          }];
        }
        else {
          hierarchy.forEach(val => {
            val.routerLink = `/modules/${val.code}?moduleID=${getItem(StorageItem.moduleID)}`
          })
          this.dashboard.items = [...hierarchy, {
            caption: this.transportService?.subModuleDraft?.value?.title || 'Add App',
            routerLink: `/modules/add-module/${getItem(StorageItem.moduleID)}`
          }];
        }
      }
    });
  }

  checkIfLabelIsUnique() {
    let unique = new Set(this.schemaForm.controls['viewSchema'].value?.map(data => data?.displayAs));
    if(unique.size !== this.schemaForm.controls['viewSchema'].value?.length) {
      return false
    }
    return true
  }

  get viewSchema() {
    return this.schemaForm.controls['viewSchema'] as FormArray;
  }

  addViewSchema() {
    const schemaForm = this.fb.group({
      fieldKey: new FormControl(''),
      displayAs: new FormControl(''),
      type: new FormControl(this.selectItems[0])
    });
    this.viewSchema.push(schemaForm)
  }

  deleteViewSchema(index: number) {
    this.viewSchema.removeAt(index);
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
      code: [item?.code || null,
      Validators.compose([
        Validators.required,
        Validators.maxLength(7)
      ]), [CodeValidator.createValidator(this.dashboard, 'submodule')]],
      companyName: [item?.companyName || null, Validators.required],
      categoryName: [item?.categoryName || null, Validators.required],
      adminUsers: [item?.adminUsers || [], Validators.required],
      viewOnlyUsers: [item?.viewOnlyUsers || [], Validators.required],
      title: [item?.title || null, Validators.compose([Validators.required]), [CodeValidator.createValidator(this.dashboard, 'submodule', 'title')]],
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
      title: ['', Validators.compose([Validators.required])],
      groupCode: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(4)])]
    });
    this.companies.push(companyForm)
  }

  getValidityForCompany(i) {
    return (<FormArray>this.companies).controls[i]?.get('title').invalid && (<FormArray>this.companies).controls[i]?.get('title').touched ;
  }

  getValidityForCompanyCode(i) {
    return ((<FormArray>this.companies).controls[i]?.get('groupCode').invalid && (<FormArray>this.companies).controls[i]?.get('groupCode').touched) || ((<FormArray>this.companies).controls[i]?.get('groupCode').invalid && (<FormArray>this.companies).controls[i]?.get('groupCode').dirty);
  }

  getValidityForCategory(i) {
    return (<FormArray>this.categories).controls[i].invalid && (<FormArray>this.categories).controls[i].touched;
  }

  removeCompany(index: number) {
    this.companies.removeAt(index);
  }

  get categories() {
    return this.f["categories"] as FormArray;
  }

  addCategory() {
    const categoryForm = this.fb.group({
      name: ['', Validators.compose([Validators.required, Validators.maxLength(40)])]
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
    let companySubmit: Array<Observable<any>> = [];
    for (let i = 0; i < this.f['companies']?.value?.length; i++) {
      const payload: any = {
        title: this.f["companies"]?.value[i]?.title,
        groupCode: this.f["companies"]?.value[i]?.groupCode
      }
      companySubmit.push(
        this.dashboard.addCompany(payload).pipe(takeUntil(this.destroy$))
      );
    }
    if(companySubmit.length > 0) {
      forkJoin(companySubmit).subscribe((values: any[]) => {
        if(values && !values.includes(undefined)) {
          for (let i = values?.length; i > 0; i--) {
            this.companies.removeAt(0);
            this.companies.removeAt(i);
            this.companies.reset();
          }
          this.getAllCompanies();
        }
      })
    }
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
    let approvers = this.workflows?.value?.flatMap(data => {
      return data?.approverIds?.map(approver => {
        return {
          id: approver.id,
          name: approver.name
        }
      })
    })
    if(approvers.length == 0) {
      return this.notif.displayNotification('Please create a default workflow before adding forms', 'Default Workflow', TuiNotification.Warning)
    }
    setItem(StorageItem.approvers, approvers)
    if(this.categoryIdForMatch) {
      this.router.navigate(['/forms/form-builder'], {queryParams: {isParent: true}});
    }
    else {
      this.router.navigate(['/forms/form-builder']);
    }
  }

  addDefaultData(i: number, content: PolymorpheusContent<TuiDialogContext>) {
    this.formForDefaultData = this.formComponents[i]
    this.defaultFormIndex = i;
    this.defaultFormSubscription.push(this.dialogs.open(content, {
      dismissible: false,
      closeable: false,
      size: 'page'
    }).subscribe())
  }

  onChangeForm(event: any) {
    if(event?.data && event?.changed) {
      if(event?.data?.file) {
        event?.data?.file?.forEach(value => {
          value.url = value?.data?.baseUrl.split('v1')[0] + value?.data?.fileUrl
        })
      }
      this.deafultFormSubmission[this.defaultFormIndex] = {data: event?.data}
    }
  }

  confirmDefaultSubmission() {
    this.formComponents[this.defaultFormIndex].defaultData = this.deafultFormSubmission[this.defaultFormIndex]
    this.defaultFormSubscription.forEach(val => val.unsubscribe())
  }

  sendFormForEdit(index: number) {
    this.transportService.isFormEdit.next(true);
    this.transportService.sendFormDataForEdit.next(this.formComponents[index]);
    this.transportService.saveDraftLocally({...this.subModuleForm.value, image: this.base64File, file: this.file});
    this.router.navigate(['/forms/form-builder']);
  }

  deleteFormDialog(content: any, index: number) {
    this.delIndex = index;
    this.dialogs.open(content, {
      dismissible: true,
      closeable: true
    }).pipe(takeUntil(this.destroy$)).subscribe()
  }

  deleteForm() {
    this.formComponents.splice(this.delIndex, 1)
    this.formTabs.splice(this.delIndex, 1)
  }

  changeLanguage(lang: string) {
    this.language.emit(lang);
  }

  setSummaryAndViewSchema() {
    if(this.checkIfLabelIsUnique() == false) {
      return this.notif.displayNotification('Field labels must be unique', 'Schema Controls', TuiNotification.Warning)
    }
    if (this.schemaForm?.value?.viewSchema[0]?.displayAs) {
      this.schemaSubscription.forEach(val => val.unsubscribe())
    }
    else {
      return this.notif.displayNotification('Please provide all data', 'Form Schema', TuiNotification.Warning)
    }
    console.log(this.schemaForm.value)
  }

  closeSchemaDialog() {
    this.schemaForm?.reset()
    this.schemaSubscription.forEach(val => val.unsubscribe())
  }

  saveSubModule(statusStr?: number) {
    if(!statusStr) {
      if(this.dataSubmitValidation() == false) {
        this.subModuleForm.markAllAsTouched();
        return this.notif.displayNotification('Please provide complete data for all fields', 'Create module', TuiNotification.Warning)
      }
      if(this.workflows.controls.map(val => val.get('approverIds')?.value.length > 1 && val.get('condition')?.value).includes('none')) {
        return this.notif.displayNotification('Please provide valid condition for the workflow step/s', 'Create module', TuiNotification.Warning)
      }
    }
    let payload: any = {
      title: this.subModuleForm.get('title')?.value,
      description: this.subModuleForm.get('description')?.value,
      url: `/modules/module-details/${this.subModuleForm.get('title')?.value.replace(/\s/g, '-').toLowerCase()}`,
      companyId: this.subModuleForm.get('companyName')?.value,
      categoryId: this.subModuleForm.get('categoryName')?.value ? this.subModuleForm.get('categoryName')?.value : this.categoryId,
      code: this.subModuleForm.get('code')?.value,
      adminUsers: this.subModuleForm.get('adminUsers')?.value?.map(data => data?.id),
      viewOnlyUsers: this.subModuleForm.get('viewOnlyUsers')?.value?.map(data => data?.id),
      formIds: this.formComponents,
      parentId: this.parentIDUnAssigned === true ? undefined : this.parentID,
      steps: this.workflows?.value?.map(data => {
        return {
          approverIds: data?.approverIds?.map(ids => ids.id ? ids.id : ids),
          condition: data?.condition,
          emailNotifyTo: data?.emailNotifyTo || []
        }
      }),
      summarySchema: this.schemaForm.value?.summarySchema?.length > 0 ? this.schemaForm.value?.summarySchema : undefined,
      viewSchema: this.schemaForm.value?.viewSchema[0]?.displayAs ? this.schemaForm.value?.viewSchema : undefined,
      accessType: this.accessTypeValue?.value?.name !== 'disabled' ? this.accessTypeValue?.value?.name : undefined
    }
    debugger
    if(statusStr) {
      this.isSavingAsDraft.next(true)
    } else {
      this.isCreatingSubModule.next(true)
    }
    if(this.file) {
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
              this.isSavingAsDraft.next(false)
              this.transportService.saveDraftLocally({});
              this.transportService.sendFormBuilderData([{title: '', key: '', display: '', components: []}]);
              this.routeToBasedOnPreviousPage()
            }
            else {
              this.isCreatingSubModule.next(false);
              this.isSavingAsDraft.next(false)
            }
          })
        }
        else {
          this.isCreatingSubModule.next(false);
          this.isSavingAsDraft.next(false)
        }
      })
    }
    else {
      this.dashboard.createSubModule(payload).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
        if(res) {
          this.isCreatingSubModule.next(false);
          this.isSavingAsDraft.next(false)
          this.transportService.saveDraftLocally({});
          this.transportService.sendFormBuilderData([{title: '', key: '', display: '', components: []}]);
          this.routeToBasedOnPreviousPage()
        }
        else {
          this.isCreatingSubModule.next(false);
          this.isSavingAsDraft.next(false)
        }
      })
    }
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
      this.workflows.controls.map(val => val.get('condition')?.value).includes('') === true
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

  openSummarySchemaDialog(content: PolymorpheusContent<TuiDialogContext>): void {
    this.schemaSubscription.push(this.dialogs
    .open(content, {
      dismissible: false,
      closeable: false,
      size: 'page'
    })
    .subscribe());
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe()
  }
}
