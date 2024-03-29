import { Component, EventEmitter, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Formio, FormioForm, FormioOptions, FormioUtils } from '@formio/angular';
import { TuiDialogContext, TuiDialogService, TuiNotification } from '@taiga-ui/core';
import { BehaviorSubject, Subject, Subscription, switchMap, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/modules/auth/auth.service';
import { DashboardService } from 'src/app/modules/dashboard/dashboard.service';
import { FormsService } from 'src/app/modules/forms/services/forms.service';
import { DataTransportService } from 'src/core/core-services/data-transport.service';
import { NotificationsService } from 'src/core/core-services/notifications.service';
import { StorageItem, getItem, getItemSession, removeItem, setItem, setItemSession } from 'src/core/utils/local-storage.utils';
import { PolymorpheusContent } from '@tinkoff/ng-polymorpheus';
import { CodeValidator, calculateAspectRatio, calculateFileSize, generateKeyCombinations, getUniqueListBy } from 'src/core/utils/utility-functions';
import { MediaUploadService } from 'src/core/core-services/media-upload.service';
import { ApiResponse } from 'src/core/models/api-response.model';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  templateUrl: './edit-submodule.component.html',
  styleUrls: ['./edit-submodule.component.scss']
})
export class EditSubmoduleComponent implements OnDestroy, OnInit {
  activeItemIndex = 0;
  topTabIndex = 0;
  activeItemIndexHooks = 0;
  previewData: any;
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
  cols: any[] = [
    "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"
  ]
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
  formKeysForViewSchema: any[] = [];
  summarySchemaFields: any[] = [];
  dropDownForButtons: any[] = [];
  formKeys: any[] = [];
  formKeysFinal: any[] = [];
  schemaSubscription: Subscription[] = [];
  defaultFormSubscription: Subscription[] = [];
  selectItems = ['Text', 'Number', 'Date'];
  schemaForm = new FormGroup({
    summarySchema: new FormControl([]),
    viewSchema: new FormArray([
      new FormGroup({
        fieldKey: new FormControl(),
        displayAs: new FormControl(''),
        type: new FormControl(this.selectItems[0])
      })
    ])
  });
  delFormId: string;
  formForDefaultData: FormioForm;
  deafultFormSubmission: any[] = [];
  deafultFormSubmissionDialog: any[] = [];
  defaultFormIndex: number;
  firstEditorPreview = false;
  secondEditorPreview = false;
  emailContent: any;
  emailContentNotify: any;
  defaultEmailTemplateFromEdit: any;
  addForms: FormControl<boolean> = new FormControl(true);
  emailContentCSS: any;
  emailContentNotifyCSS: any;
  editorOptions = {theme: 'vs-dark', language: 'handlebars'};
  cssEditorOptions = {theme: 'vs-dark', language: 'css'};
  jsEditorOptions = {theme: 'vs-dark', language: 'javascript'};
  triggerCode: string;
  pdfTempCode: string;
  triggerCodeAfter: string;
  eventCodeOnChange: string;
  eventCodeOnLoad: string;
  eventComponent = new FormControl(null)

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
    private media: MediaUploadService,
    private domSanitizer: DomSanitizer
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
        const hierarchy = getItemSession(StorageItem.navHierarchy) || [];
        hierarchy.forEach(val => {
          val.routerLink = `/modules/${val.code}?moduleID=${getItemSession(StorageItem.moduleID)}`
        })
        this.dashboard.items = getUniqueListBy([...hierarchy, {
          caption: getItemSession(StorageItem.editmoduleTitle) || getItemSession(StorageItem.moduleSlug),
          routerLink: `/modules/edit-module/${getItemSession(StorageItem.editmoduleId)}`
        }], 'caption')
      }
      else {
        if(this.router.url.includes('moduleCode')) {
          this.dashboard.items = getUniqueListBy([{
            caption: getItemSession(StorageItem.editmoduleTitle) || getItemSession(StorageItem.moduleSlug),
            routerLink: `/modules/edit-module/${getItemSession(StorageItem.editmoduleId)}?moduleCode=${getItemSession(StorageItem.moduleSlug)}`
          }], 'caption')
        }
        else {
          const hierarchy = getItemSession(StorageItem.navHierarchy) || [];
          hierarchy.forEach(val => {
            val.routerLink = `/modules/${val.code}?moduleID=${getItemSession(StorageItem.moduleID)}`
          })
          this.dashboard.items = getUniqueListBy([{
            caption: getItemSession(StorageItem.editmoduleTitle) || getItemSession(StorageItem.moduleSlug),
            routerLink: `/modules/edit-module/${getItemSession(StorageItem.editmoduleId) || getItemSession(StorageItem.moduleID)}`
          }], 'caption')
        }
      }
    });
  }

  setPreview(i: any) {
    if(i == 0) {
      this.previewData = '<style>' + this.emailContentCSS + '</style>' + this.emailContent;
      this.previewData = this.domSanitizer.bypassSecurityTrustHtml(this.previewData)
    }
    if(i == 1) {
      this.previewData = '<style>' + this.emailContentNotifyCSS + '</style>' + this.emailContentNotify;
      this.previewData = this.domSanitizer.bypassSecurityTrustHtml(this.previewData)
    }
  }

  sanitizeSubmission(value: any) {
    let data = value?.data;
    if(data) {
      for (const key in data) {
        if(typeof(data[key]) == 'string') {
          data[key] = data[key]?.replace(/&lt;/g, "<")?.replace(/&gt;/g, ">");
        }
        if(key == 'dataGrid' || key == 'editGrid') {
          data[key]?.forEach(newVal => {
            for (const key2 in newVal) {
              if(typeof(newVal[key2]) == 'string') {
                newVal[key2] = newVal[key2]?.replace(/&lt;/g, "<")?.replace(/&gt;/g, ">");
              }
            }
          })
        }
      }
    }
    return value
  }

  openModifyEditorDialog(
    content: PolymorpheusContent<TuiDialogContext>
  ): void {
    this.saveDialogSubscription.push(this.dialogs
      .open(content, {
        dismissible: false,
        closeable: false,
        size: 'l'
      })
      .subscribe());
  }

  confirmEmailTemplate() {
    this.saveDialogSubscription.forEach(val => val.unsubscribe())
  }

  cancelEmailTemplate() {
    this.emailContent = this.defaultEmailTemplateFromEdit.action || this.dashboard.emailContent;
    this.emailContentNotify = this.defaultEmailTemplateFromEdit.notify || this.dashboard.emailContentNotify;
    this.emailContentCSS = this.defaultEmailTemplateFromEdit.actionCSS || this.dashboard.emailContentCSS;
    this.emailContentNotifyCSS = this.defaultEmailTemplateFromEdit.notifyCSS || this.dashboard.emailContentNotifyCSS;
    this.saveDialogSubscription.forEach(val => val.unsubscribe())
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
    this.viewSchema.removeAt(index)
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
        this.dashboard.excludeIdEmitter.emit(params['id'])
        this.transportService.subModuleID.next(params['id']); // the id used to fetch the submodule data and to redirect from form builder
        this.dashboard.getSubModuleByID(params['id']).subscribe((response: any) => {
          if(response) {
            this.addForms.setValue(response?.formVisibility)
            this.workFlowId = response?.workFlowId?.id;
            this.categoryId = response?.categoryId?.id;
            this.pdfTempCode = response?.pdfTemplate?.replace(/&lt;/g, "<")?.replace(/&gt;/g, ">");;
            response.emailTemplate = {
              action: response.emailTemplate?.action?.replace(/&lt;/g, "<")?.replace(/&gt;/g, ">"),
              notify: response.emailTemplate?.notify?.replace(/&lt;/g, "<")?.replace(/&gt;/g, ">")
            }
            this.defaultEmailTemplateFromEdit = response.emailTemplate;
            this.triggerCode = response.triggers[0]?.code?.replace(/&lt;/g, "<")?.replace(/&gt;/g, ">") || `function x(submission) {
              console.log(submission, "Hello world!");
            }`;
            this.triggerCodeAfter = response.triggers[1]?.code?.replace(/&lt;/g, "<")?.replace(/&gt;/g, ">") || `function x(submission) {
              console.log(submission, "Hello world!");
            }`;
            this.eventCodeOnChange = response.events[0]?.code?.replace(/&lt;/g, "<")?.replace(/&gt;/g, ">");
            this.eventCodeOnLoad = response.events[1]?.code?.replace(/&lt;/g, "<")?.replace(/&gt;/g, ">");
            this.emailContent = this.defaultEmailTemplateFromEdit.action || this.dashboard.emailContent;
            this.emailContentNotify = this.defaultEmailTemplateFromEdit.notify || this.dashboard.emailContentNotify;
            this.emailContentCSS = this.defaultEmailTemplateFromEdit.actionCSS || this.dashboard.emailContentCSS;
            this.emailContentNotifyCSS = this.defaultEmailTemplateFromEdit.notifyCSS || this.dashboard.emailContentNotifyCSS;
            this.schemaForm.controls['summarySchema']?.setValue(response?.summarySchema);
            if(response.viewSchema?.length > 0) {
              this.schemaForm.controls['viewSchema'].removeAt(0);
            }
            response.viewSchema?.map(data => {
              const schemaForm = this.fb.group({
                fieldKey: new FormControl(data?.fieldKey),
                displayAs: new FormControl(data?.displayAs),
                type: new FormControl(data?.type)
              });
              this.schemaForm.controls['viewSchema'].push(schemaForm)
            })
            this.items?.forEach((value, index) => {
              if (value?.name == response?.accessType) {
                this.accessTypeValue?.setValue(this.items[index])
              }
            })
            if(Object.keys(this.submoduleFromLS)?.length > 0) {
              this.initSubModuleForm(this.submoduleFromLS);
              this.base64File = this.submoduleFromLS?.image;
              this.file = this.submoduleFromLS?.file;
              response?.formIds?.forEach(value => {
                FormioUtils.eachComponent(value?.components, (component) => {
                  if(component.type == 'select') {
                    component.template = component?.template?.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
                  }
                  if(component?.html) {
                    component.html = component.html?.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
                  }
                  if(component.type == 'editgrid') {
                    for (const key in component.templates) {
                      component.templates[key] = component.templates[key]?.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
                    }
                  }
                }, true)
              })
              this.formComponents = response?.formIds;
              this.formTabs = response?.formIds?.map(forms => forms.title);
              let formComps = JSON.parse(JSON.stringify(this.formComponents));
              formComps?.map(form => {
                this.formKeys?.push({[form.key]: FormioUtils.flattenComponents(form?.components, true)})
              })
              this.summarySchemaFields = this.formKeys.flatMap(val => {
                let res = generateKeyCombinations(val)
                return res
              });

              this.formKeysForViewSchema = this.summarySchemaFields;
              formComps?.map((data, index) => {
                if(data?.defaultData) {
                  this.defaultFormIndex = index
                  this.deafultFormSubmission[this.defaultFormIndex] = data?.defaultData;
                }
              })
            }
            else {
              response?.formIds?.forEach(value => {
                FormioUtils.eachComponent(value?.components, (component) => {
                  if(component.type == 'select') {
                    component.template = component?.template?.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
                  }
                  if(component?.html) {
                    component.html = component.html?.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
                  }
                  if(component.type == 'editgrid') {
                    for (const key in component.templates) {
                      component.templates[key] = component.templates[key]?.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
                    }
                  }
                }, true)
              })
              this.formComponents = response?.formIds;
              this.formTabs = response?.formIds?.map(forms => forms.title);
              let formComps = JSON.parse(JSON.stringify(this.formComponents));
              formComps?.map(form => {
                this.formKeys?.push({[form.key]: FormioUtils.flattenComponents(form?.components, true)})
              })
              this.summarySchemaFields = this.formKeys.flatMap(val => {
                let res = generateKeyCombinations(val)
                return res;
              });
              this.formKeysForViewSchema = this.summarySchemaFields;
              formComps?.map((data, index) => {
                if(data?.defaultData) {
                  this.defaultFormIndex = index
                  this.deafultFormSubmission[this.defaultFormIndex] = data?.defaultData;
                }
              })
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
              });
              const colWidth = response?.layout?.colWidth || "4"
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
                {adminUsers: adminUsers},
                {colWidth: colWidth}
              )
              this.transportService.saveDraftLocally(finalObject);
              this.initSubModuleForm(finalObject)
            }
          }
        })
      }
    });
  }

  getValidityForWorkflowStep() {
    return (<FormArray>this.workflows).controls[0]?.get('approverIds')?.hasError('required') && (<FormArray>this.workflows).controls[0]?.get('approverIds')?.touched
  }

  applySummarySchemaValuesToViewSchema(data: any) {
    data?.forEach((val, index) => {
      this.schemaForm?.controls['viewSchema']?.value?.forEach((data, i) => {
        if(data?.fieldKey !== val) {
          this.schemaForm?.controls['viewSchema']?.removeAt(i)
        }
      })
    })
    if(data?.length == 0) {
      this.schemaForm?.controls['viewSchema']?.removeAt(0)
    }
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
      code: [item?.code, Validators.compose([
        Validators.required
      ]), [CodeValidator.createValidator(this.dashboard, 'submodule')]],
      companyId: [item?.companyId?.value ? item?.companyId?.value : this.companyList?.filter(val => item?.companyId === val.value)[0]?.value || null, Validators.required],
      title: [item?.title || null, Validators.compose([
        Validators.required
      ]), [CodeValidator.createValidator(this.dashboard, 'submodule', 'title')]],
      image: [item?.image || null, Validators.required],
      description: [item?.description || null, Validators.required],
      adminUsers: [item?.adminUsers || [], Validators.required],
      viewOnlyUsers: [item?.viewOnlyUsers || [], Validators.required],
      colWidth: [item?.colWidth || "4"],
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

  addDefaultData(i: number, content: PolymorpheusContent<TuiDialogContext>) {
    this.formForDefaultData = this.formComponents[i]
    this.defaultFormIndex = i;
    this.defaultFormSubscription.push(this.dialogs.open(content, {
      dismissible: false,
      closeable: false,
      size: 'l'
    }).subscribe())
  }

  onChangeForm(event: any) {
    if(event?.data && event?.changed && event.isModified == true) {
      event.changed.component.validate = {}
      if(event?.data?.file) {
        event?.data?.file?.forEach(value => {
          value.url = value?.data?.baseUrl.split('v1')[0] + value?.data?.fileUrl
        })
      }
      this.deafultFormSubmissionDialog[this.defaultFormIndex] = {data: event?.data}
    }
  }

  confirmDefaultSubmission() {
    this.deafultFormSubmission = this.deafultFormSubmissionDialog;
    this.formComponents[this.defaultFormIndex].defaultData = this.deafultFormSubmission[this.defaultFormIndex];
    let payload = {
      ...this.formComponents[this.defaultFormIndex],
      revisionNo: undefined,
      id: undefined,
      createdBy: undefined,
      status: undefined,
      updatedBy: undefined
    }
    this.formService.updateForm(this.formComponents[this.defaultFormIndex]?.id, payload)
    .pipe(takeUntil(this.destroy$)).subscribe(val => {
      if(val) {
        this.defaultFormSubscription.forEach(val => val.unsubscribe())
      }
    })
  }

  sendFormForEdit(i: number, formID: string, key: string) {
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
    this.transportService.editBreadcrumbs.next(this.dashboard.items)
    setItemSession(StorageItem.editBreadcrumbs, this.dashboard.items)
    setItemSession(StorageItem.approvers, approvers)
    setItemSession(StorageItem.formKey, key)
    if(formID) {
      setItemSession(StorageItem.formEdit, true);
      this.transportService.saveDraftLocally({...this.subModuleForm.value, image: this.base64File, file: this.file});
      this.router.navigate(['/forms/edit-form'], {queryParams: {id: formID}});
    }
    else {
      setItemSession(StorageItem.formEdit, true)
      this.transportService.isFormEdit.next(true);
      this.transportService.sendFormDataForEdit.next(this.formComponents[i]);
      this.transportService.saveDraftLocally({...this.subModuleForm.value, image: this.base64File, file: this.file});
      this.router.navigate(['/forms/edit-form'], {queryParams: {submoduleID: this.transportService.subModuleID?.value}});
    }
  }

  deleteFormDialog(content: any, id: string) {
    this.delFormId = id;
    this.dialogs.open(content, {
      dismissible: true,
      closeable: true
    }).pipe(takeUntil(this.destroy$)).subscribe()
  }

  deleteForm() {
    this.formService.deleteForm(this.delFormId).pipe(takeUntil(this.destroy$))
    .subscribe(res => {
      this.getSubmoduleByIDForEdit();
    })
  }

  saveDraft() {
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
    setItemSession(StorageItem.approvers, approvers)
    this.transportService.sendFormBuilderData(this.formComponents)
    this.transportService.saveDraftLocally({...this.subModuleForm.value, image: this.base64File, file: this.file});
    this.transportService.editBreadcrumbs.next(this.dashboard.items)
    setItemSession(StorageItem.editBreadcrumbs, this.dashboard.items)
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
      return
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
      return
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
    let slug = getItemSession(StorageItem.moduleSlug);
    if(slug) {
      this.router.navigate(['/modules', getItemSession(StorageItem.moduleSlug)], {queryParams: {moduleID: getItemSession(StorageItem.moduleID)}});
    }
    else {
      this.router.navigate(['/dashboard/home'])
    }
  }

  checkIfLabelIsUnique() {
    let unique = new Set(this.schemaForm.controls['viewSchema'].value?.map(data => data?.displayAs));
    if(unique.size !== this.schemaForm.controls['viewSchema'].value?.length) {
      return false
    }
    return true
  }

  setSummaryAndViewSchema() {
    if(this.checkIfLabelIsUnique() == false) {
      return this.notif.displayNotification('Field labels must be unique', 'Schema Controls', TuiNotification.Warning)
    }
    if (this.schemaForm?.value?.viewSchema[0]?.displayAs) {
      this.saveDialogSubscription.forEach(val => val.unsubscribe())
    }
    else {
      return this.notif.displayNotification('Please provide all data', 'Form Schema', TuiNotification.Warning)
    }
  }

  closeSchemaDialog() {
    this.saveDialogSubscription.forEach(val => val.unsubscribe())
    this.schemaSubscription.forEach(val => val.unsubscribe())
  }

  openTriggeOrPdfOrSummarySchemaDialog(
    content: PolymorpheusContent<TuiDialogContext>
  ): void {
    this.saveDialogSubscription.push(this.dialogs
      .open(content, {
        dismissible: false,
        closeable: false,
        size: 'l'
      })
      .subscribe());
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
      // workFlowId: this.workFlowId,
      title: this.subModuleForm.get('title')?.value,
      description: this.subModuleForm.get('description')?.value,
      code: this.subModuleForm.get('code')?.value,
      adminUsers: this.subModuleForm.get('adminUsers')?.value?.map(data => data?.id),
      viewOnlyUsers: this.subModuleForm.get('viewOnlyUsers')?.value?.map(data => data?.id),
      colWidth: this.f['colWidth']?.value || "4",
      steps: this.workflows?.value?.map(data => {
        return {
          id: data?.id ? data?.id : undefined,
          approverIds: data?.approverIds?.map(ids => ids.id ? ids.id : ids),
          condition: data?.condition,
          emailNotifyTo: data?.emailNotifyTo || [],
          emailNotifyToId: data?.emailNotifyToId ? data?.emailNotifyToId : undefined,
        }
      }),
      formVisibility: this.addForms.value,
      summarySchema: this.schemaForm.value?.summarySchema?.length > 0 ? this.schemaForm.value?.summarySchema : undefined,
      viewSchema: this.schemaForm.value?.viewSchema[0]?.displayAs ? this.schemaForm.value?.viewSchema : undefined,
      accessType: this.accessTypeValue?.value?.name,
      pdfTemplate: this.pdfTempCode || undefined,
      emailTemplate: {
        action: this.emailContent,
        actionCSS: this.emailContentCSS,
        notify: this.emailContentNotify,
        notifyCSS: this.emailContentNotifyCSS
      },
      triggers: [
        {
          name: 'beforeSubmit',
          code: this.triggerCode || 'function beforeSubmit(){}'
        },
        {
          name: 'afterSubmit',
          code: this.triggerCodeAfter || 'function afterSubmit(){}'
        }
      ],
      events: [
        {
          name: 'onChange',
          code: this.eventCodeOnChange || "function onChange(event){console.log('On Change Works!')}"
        },
        {
          name: 'onLoad',
          code: this.eventCodeOnLoad || "function onLoad(event){console.log('On Load Works!')}"
        }
      ]
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
    removeItem(StorageItem.editmoduleId)
    removeItem(StorageItem.editmoduleSlug)
  }

  routeToBasedOnPreviousPage() {
    this.activatedRoute.queryParams.pipe(takeUntil(this.destroy$)).subscribe(val => {
      if(Object.keys(val).length > 0) {
        this.router.navigate(['/dashboard/home'])
      }
      else {
        this.router.navigate(['/modules', getItemSession(StorageItem.moduleSlug) || ''], {queryParams: {moduleID: getItemSession(StorageItem.moduleID) || ''}});
      }
    })
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
