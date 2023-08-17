import { Component, EventEmitter, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormioOptions } from '@formio/angular';
import { TuiDialogContext, TuiDialogService, TuiNotification } from '@taiga-ui/core';
import { BehaviorSubject, Subject, Subscription, switchMap, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/modules/auth/auth.service';
import { DashboardService } from 'src/app/modules/dashboard/dashboard.service';
import { FormsService } from 'src/app/modules/forms/services/forms.service';
import { DataTransportService } from 'src/core/core-services/data-transport.service';
import { NotificationsService } from 'src/core/core-services/notifications.service';
import { StorageItem, getItem, setItem } from 'src/core/utils/local-storage.utils';
import { PolymorpheusContent } from '@tinkoff/ng-polymorpheus';
import { calculateAspectRatio, calculateFileSize } from 'src/core/utils/utility-functions';
import { MediaUploadService } from 'src/core/core-services/media-upload.service';
import { ApiResponse } from 'src/core/models/api-response.model';

@Component({
  templateUrl: './edit-submodule.component.html',
  styleUrls: ['./edit-submodule.component.scss']
})
export class EditSubmoduleComponent implements OnDestroy, OnInit {
  subModuleForm!: FormGroup;
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
  domainUrl = window.location.origin;
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
  submoduleFromLS: any;
  workFlowId: string;
  categoryList: any[];
  categoryId: string;
  items = [{name: 'anyCreate'}, {name: 'anyCreateAndModify'}, {name: 'disabled'}];
  accessTypeValue: FormControl

  constructor(
    private fb: FormBuilder,
    public auth: AuthService,
    public transportService: DataTransportService,
    private router: Router,
    private dashboard: DashboardService,
    private activatedRoute: ActivatedRoute,
    private notif: NotificationsService,
    private formService: FormsService,
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
    private media: MediaUploadService
  ) {
    this.initSubModuleForm();
    this.accessTypeValue = new FormControl(null)
    this.submoduleFromLS = this.transportService.subModuleDraft.value;
    // get submodule for editing and initialize form
    this.getAllCompanies();
    this.getAllCategories();
    this.getSubmoduleByIDForEdit();
    this.activatedRoute.queryParams.pipe(takeUntil(this.destroy$)).subscribe(val => {
      if(val['moduleID'] && val['moduleCode']) {
        this.transportService.moduleID.next(val['moduleID']);
        this.transportService.moduleCode.next(val['moduleCode']);
      }
    });

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
          caption: 'Edit App',
          routerLink: `/modules/edit-module/${getItem(StorageItem.moduleID)}`
        }];
      }
    })
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

  getSubmoduleByIDForEdit() {
    this.activatedRoute.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if(params['id']) {
        this.transportService.subModuleID.next(params['id']); // the id used to fetch the submodule data and to redirect from form builder
        this.dashboard.getSubModuleByID(params['id']).subscribe((response: any) => {
          if(response) {
            this.workFlowId = response?.workFlowId?.id;
            this.categoryId = response?.categoryId?.id;
            this.items?.forEach((value, index) => {
              if (value?.name == response?.accessType) {
                this.accessTypeValue?.setValue(this.items[index])
              }
            })
            if(Object.keys(this.submoduleFromLS)?.length > 0) {
              this.initSubModuleForm(this.submoduleFromLS);
              this.base64File = this.submoduleFromLS?.image;
              this.file = this.submoduleFromLS?.file;
              this.formComponents = response?.formIds;
              this.formTabs = response?.formIds?.map(forms => forms.title);
            }
            else {
              this.formComponents = response?.formIds;
              this.formTabs = response?.formIds?.map(forms => forms.title);
              const companyId = {
                value: response?.companyId?.id,
                label: response?.companyId?.title
              }
              const categoryId = {
                value: response?.categoryId?.id,
                label: response?.categoryId?.name
              }
              this.file = response?.image
              this.base64File = response?.image
              // const url = response?.url?.split('/').at(-1);
              const workFlowId = response?.workFlowId?.stepIds?.map(data => {
                return {
                  id: data?.id,
                  approverIds: data?.approverIds?.map(ids => {
                    return {
                      name: ids?.fullName,
                      id: ids?.id,
                      control: new FormControl<boolean>(true)
                    }
                  }),
                  condition: data?.condition,
                  emailNotifyTo: data?.emailNotifyToId?.notifyUsers || [],
                  emailNotifyToId: data?.emailNotifyToId?.id
                }
              });
              const adminUsers = response?.adminUsers?.map(val => {
                return {
                  name: val?.fullName,
                  id: val?.id,
                  control: new FormControl<boolean>(true)
                }
              });
              const viewOnlyUsers = response?.viewOnlyUsers?.map(val => {
                return {
                  name: val?.fullName,
                  id: val?.id,
                  control: new FormControl<boolean>(true)
                }
              })
              delete response?.workFlowId;
              delete response?.url;
              delete response?.companyId;
              delete response?.categoryId;
              const finalObject = Object.assign(
                response,
                {workFlowId: workFlowId},
                {categoryId: categoryId},
                {companyId: companyId},
                {viewOnlyUsers: viewOnlyUsers},
                {adminUsers: adminUsers}
              )
              this.transportService.saveDraftLocally(finalObject);
              this.initSubModuleForm(finalObject)
            }
          }
        })
      }
    });
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
    });
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

  initSubModuleForm(item?: any) {
    this.subModuleForm = this.fb.group({
      categoryId: [item?.categoryId?.value ? item?.categoryId?.value : this.categoryList?.filter(val => item?.categoryId === val.value)[0]?.value || null, Validators.required],
      code: [{value: item?.code || null, disabled: true}],
      companyId: [item?.companyId?.value ? item?.companyId?.value : this.companyList?.filter(val => item?.companyId === val.value)[0]?.value || null, Validators.required],
      title: [item?.title || null, Validators.required],
      image: [item?.image || null, Validators.required],
      description: [item?.description || null, Validators.required],
      adminUsers: [item?.adminUsers || [], Validators.required],
      viewOnlyUsers: [item?.viewOnlyUsers || [], Validators.required],
      workFlowId: item?.workFlowId ?
      this.fb.array(
        item?.workFlowId?.map((val: { condition: any; approverIds: any; emailNotifyTo: any; emailNotifyToId: any; id: any }) => {
          return this.fb.group({
            id: val.id,
            condition: [val.condition, Validators.required],
            approverIds: [val.approverIds, Validators.required],
            emailNotifyTo: [val.emailNotifyTo || [], Validators.required],
            emailNotifyToId: val?.emailNotifyToId,
          })
        })
      )
      :
      this.fb.array([
        this.fb.group({
          condition: ['', Validators.required],
          approverIds: [[], Validators.required],
          emailNotifyTo: [[], Validators.required]
        })
      ])
    })
  }

  get f() {
    return this.subModuleForm.controls;
  }

  setAdminUsers(users: string[]) {
    this.subModuleForm?.get('adminUsers')?.setValue(users)
  }

  setViewUsers(users: string[]) {
    this.subModuleForm?.get('viewOnlyUsers')?.setValue(users)
  }

  sendFormForEdit(i: number, formID: string) {
    if(formID) {
      setItem(StorageItem.formEdit, true);
      this.transportService.saveDraftLocally({...this.subModuleForm.value, image: this.base64File, file: this.file});
      this.router.navigate(['/forms/edit-form'], {queryParams: {id: formID}});
    }
    else {
      setItem(StorageItem.formEdit, true)
      this.transportService.isFormEdit.next(true);
      this.transportService.sendFormDataForEdit.next(this.formComponents[i]);
      this.transportService.saveDraftLocally({...this.subModuleForm.value, image: this.base64File, file: this.file});
      this.router.navigate(['/forms/edit-form'], {queryParams: {submoduleID: this.transportService.subModuleID?.value}});
    }
  }

  deleteForm(id: string) {
    this.formService.deleteForm(id).pipe(takeUntil(this.destroy$))
    .subscribe(res => {
      this.getSubmoduleByIDForEdit();
    })
  }

  saveDraft() {
    this.transportService.sendFormBuilderData(this.formComponents)
    this.transportService.saveDraftLocally({...this.subModuleForm.value, image: this.base64File, file: this.file});
    this.router.navigate(['/forms/edit-form']);
  }

  get workflows() {
    return this.f['workFlowId'] as FormArray
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

  validateSelection(index: number) {
    this.errorIndex = index;
    if(this.workflows.at(index)?.get('approverIds')?.value?.length < 2) {
      this.workflows.at(index)?.get('condition')?.setValue('none');
      
      return this.notif.displayNotification('Default condition of "None" will be used if the number of approvers is less than 2', 'Create Submodule', TuiNotification.Info)
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
      
      return this.notif.displayNotification('Default condition of "None" will be used if the number of approvers is less than 2', 'Create Module', TuiNotification.Info)
    }
    if(value >= 2 && this.workflows.at(index)?.get('condition')?.value == 'none') {
      
      return this.showError.next(true)
    }
    this.showError.next(false)
  }

  dataSubmitValidation() {
    if(
      // this.f['url']?.invalid ||
      this.f['companyId']?.invalid ||
      this.workflows?.length == 0 ||
      this.workflows.controls.map(val => val.get('approverIds')?.value.length == 0).includes(true) ||
      this.workflows.controls.map(val => val.get('condition')?.value).includes('') === true ||
      Object.values(this.formComponents)[0]?.components?.length == 0
    ) {
      return false
    }
    return true
  }

  cancelSubmodule() {
    let slug = getItem(StorageItem.moduleSlug);
    if(slug) {
      this.router.navigate(['/modules', getItem(StorageItem.moduleSlug)], {queryParams: {moduleID: getItem(StorageItem.moduleID)}});
    }
    else {
      this.router.navigate(['/dashboard/home'])
    }
  }

  saveSubModule(statusStr?: number) {
    if(!statusStr) {
      if(this.dataSubmitValidation() == false) {
        this.subModuleForm.markAllAsTouched();
        return this.notif.displayNotification('Please provide all data', 'Edit Submodule', TuiNotification.Warning)
      }
      if(this.workflows.controls.map(val => val.get('approverIds')?.value.length > 1 && val.get('condition')?.value).includes('none')) {
        return this.notif.displayNotification('Please provide valid condition for the workflow step/s', 'Create Submodule', TuiNotification.Warning)
      }
    }
    if(statusStr) {
      this.isSavingAsDraft.next(true)
    } else {
      this.isCreatingSubModule.next(true)
    }
    let payload = {
      url: `/modules/module-details/${this.subModuleForm.get('title')?.value.replace(/\s/g, '-').toLowerCase()}`,
      companyId: this.subModuleForm.get('companyId')?.value,
      categoryId: this.subModuleForm.get('categoryId')?.value ? this.subModuleForm.get('categoryId')?.value : this.categoryId,
      image: this.subModuleForm.get('image')?.value,
      workFlowId: this.workFlowId,
      title: this.subModuleForm.get('title')?.value,
      description: this.subModuleForm.get('description')?.value,
      code: this.subModuleForm.get('title')?.value.replace(/\s/g, '-').toLowerCase(),
      adminUsers: this.subModuleForm.get('adminUsers')?.value?.map(data => data?.id),
      viewOnlyUsers: this.subModuleForm.get('viewOnlyUsers')?.value?.map(data => data?.id),
      steps: this.workflows?.value?.map(data => {
        return {
          id: data?.id ? data?.id : undefined,
          approverIds: data?.approverIds?.map(ids => ids.id ? ids.id : ids),
          condition: data?.condition,
          emailNotifyTo: data?.emailNotifyTo || [],
          emailNotifyToId: data?.emailNotifyToId ? data?.emailNotifyToId : undefined,
        }
      }),
      accessType: this.accessTypeValue?.value?.name
    }
    if(statusStr) {
      const status = statusStr;
      Object.assign(payload, {status})
    }
    else {
      Object.assign(payload, {status: 1})
    }
    if(typeof this.file == 'string') {
      const url = 'uploads' + payload?.image.split('uploads')[1];
      payload = {...payload, image: url };
      this.dashboard.updateSubModule(this.transportService.subModuleID?.value, payload)
      .pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
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
      this.media.uploadMedia(this.file).pipe(takeUntil(this.destroy$)).subscribe((res: ApiResponse<any>) => {
        if(!res.hasErrors()) {
          payload = {...payload, image: res?.data?.fileUrl };
          this.dashboard.updateSubModule(this.transportService.subModuleID?.value, payload)
          .pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
            if(res) {
              this.isCreatingSubModule.next(false);
              this.transportService.saveDraftLocally({});
              this.transportService.sendFormBuilderData([{title: '', key: '', display: '', components: []}]);
              this.routeToBasedOnPreviousPage();
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

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
