import { Component, EventEmitter, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import Editor from 'ckeditor5/build/ckeditor';
import { CKEditorComponent } from '@ckeditor/ckeditor5-angular';

@Component({
  templateUrl: './add-submodule.component.html',
  styleUrls: ['./add-submodule.component.scss']
})
export class AddSubmoduleComponent implements OnDestroy, OnInit {
  public Editor = Editor.Editor;
  @ViewChild('editor') editor: CKEditorComponent
  @ViewChild('editor2') editor2: CKEditorComponent
  subModuleForm!: FormGroup;
  activeItemIndex = 0;
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
  cols: any[] = [
    "3", "4", "5", "6", "7", "8", "9", "10", "11", "12" 
  ];
  addForms: FormControl<boolean> = new FormControl(true)
  firstEditorPreview = false;
  secondEditorPreview = false;
  
  emailContent: any = `
  <table class="wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation">
   <tr>
      <td align="center">
         <table class="content" width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
               <td class="header">
                  <a href="http://127.0.0.1:8080/">
                  </a>
               </td>
            </tr>
            <tr>
               <td class="body">
                  <table class="inner-body" align="center" width="570" cellpadding="0" cellspacing="0"
                     role="presentation">
                     <tr class="header">
                        <td>
                           <a href="http://127.0.0.1:8080/">
                              <img src="https://depa.com/images/logo.png" alt="DEPA Organization Logo"
                                 class="logo">
                           </a>
                        </td>
                     </tr>
                     <tr>
                        <td class="content-cell">
                           <h1>Hello!</h1>
                           <div class="form-data">
                              <h3>Forms data</h3>
                              <table class="approval-log">
                                 {{#each formsData}}
                                 <tr>
                                    <th colspan=2>Form Title: {{formId.title}}</th>
                                 </tr>
                                 <tr>
                                    <th>key</th>
                                    <th>value</th>
                                 </tr>
                                 {{#each data}}
                                 <tr>
                                    <td>{{@key}}</td>
                                    <td>{{this}}</td>
                                 </tr>
                                 {{/each}}
                                 {{/each}}
                              </table>
                           </div>
                           <h3>Summary</h3>
                           <table class="summary-data">
                              <tr>
                                 <th>Progress</th>
                                 <th>Recent Activity</th>
                                 <th>Pending On</th>
                              </tr>
                              <tr>
                                 <td>{{summaryData.progress}}%</td>
                                 <td>{{summaryData.lastActivityPerformedBy.fullName}}</td>
                                 <td>
                                    {{#each summaryData.pendingOnUsers}}
                                    {{this.fullName}}{{#unless @last}}, {{/unless}}
                                    {{/each}}
                                 </td>
                              </tr>
                           </table>
                           <h3>Approval logs</h3>
                           <table class="approval-log">
                              <tr>
                                 <th>Performed By</th>
                                 <th>Decision</th>
                                 <th>Comments</th>
                              </tr>
                              {{#each approvalLogs}}
                              <tr>
                                 <td>{{performedById.fullName}}</td>
                                 <td>{{approvalStatus}}</td>
                                 <td>{{remarks}}</td>
                              </tr>
                              {{/each}}
                           </table>
                           <p>Now it's your turn to execute the workflow. Please perform the necessary
                              action as soon as possible so that the rest of the workflow can be executed.
                           </p>
                           <div class="btn-align" cellpadding="0">
                              <a id="accept-button"
                                 href="https://depa-frontend.pages.dev/email-submission?submissionId={{submissionId}}&stepId={{stepId}}&userId={{userId}}&isApproved=true"
                                 class="button button-primary" target="_self"
                                 rel="noopener">Approve</a>
                              <a id="reject-button"
                                 href="https://depa-frontend.pages.dev/email-submission?submissionId={{submissionId}}&stepId={{stepId}}&userId={{userId}}&isApproved="
                                 class="button button-danger" target="_self"
                                 rel="noopener">Reject</a>
                           </div>
                           <p>Regards,<br> DEPA Groups</p>
                        </td>
                     </tr>
                  </table>
               </td>
            </tr>
         </table>
      </td>
   </tr>
</table>
  `;
  emailContentNotify: any = `
  <table class="wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation">
   <tr>
      <td align="center">
         <table class="content" width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
               <td class="header">
                  <a href="http://127.0.0.1:8080/">
                  </a>
               </td>
            </tr>
            <tr>
               <td class="body">
                  <table class="inner-body" align="center" width="570" cellpadding="0" cellspacing="0"
                     role="presentation">
                     <tr class="header">
                        <td>
                           <a href="http://127.0.0.1:8080/">
                              <img src="https://depa.com/images/logo.png" alt="DEPA Organization Logo"
                                 class="logo">
                           </a>
                        </td>
                     </tr>
                     <tr>
                        <td class="content-cell">
                           <h1>Hello!</h1>
                           <div class="form-data">
                              <h3>Forms data</h3>
                              <table class="approval-log">
                                 {{#each formsData}}
                                 <tr>
                                    <th colspan=2>Form Title: {{formId.title}}</th>
                                 </tr>
                                 <tr>
                                    <th>key</th>
                                    <th>value</th>
                                 </tr>
                                 {{#each data}}
                                 <tr>
                                    <td>{{@key}}</td>
                                    <td>{{this}}</td>
                                 </tr>
                                 {{/each}}
                                 {{/each}}
                              </table>
                           </div>
                           <h3>Summary</h3>
                           <table class="summary-data">
                              <tr>
                                 <th>Progress</th>
                                 <th>Recent Activity</th>
                                 <th>Pending On</th>
                              </tr>
                              <tr>
                                 <td>{{summaryData.progress}}%</td>
                                 <td>{{summaryData.lastActivityPerformedBy.fullName}}</td>
                                 <td>
                                    {{#each summaryData.pendingOnUsers}}
                                    {{this.fullName}}{{#unless @last}}, {{/unless}}
                                    {{/each}}
                                 </td>
                              </tr>
                           </table>
                           <h3>Approval logs</h3>
                           <table class="approval-log">
                              <tr>
                                 <th>Performed By</th>
                                 <th>Decision</th>
                                 <th>Comments</th>
                              </tr>
                              {{#each approvalLogs}}
                              <tr>
                                 <td>{{performedById.fullName}}</td>
                                 <td>{{approvalStatus}}</td>
                                 <td>{{remarks}}</td>
                              </tr>
                              {{/each}}
                           </table>
                           <p>The last action has been performed by the user, and the action is
                           "blablabla". Currently, the step is active
                           for the following users: User A, User B, and User C.
                           </p>
                           <p>Regards,<br> DEPA Groups</p>
                        </td>
                     </tr>
                  </table>
               </td>
            </tr>
         </table>
      </td>
   </tr>
</table>
  `;
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
  deafultFormSubmissionDialog: any[] = [];
  defaultFormIndex: number;
  defaultFormSubscription: Subscription[] = [];
  inheritLoader = new Subject<boolean>();
  public editorConfig = {
    toolbar: {
			items: [
				'heading',
        'alignment',
				'|',
				'bold',
				'italic',
				'link',
				'bulletedList',
				'numberedList',
				'|',
				'outdent',
				'indent',
				'|',
				'blockQuote',
				'insertTable',
				'fontColor',
				'fontFamily',
				'horizontalLine',
				'fontSize',
				'mediaEmbed',
				'undo',
				'redo',
				'codeBlock',
				'code',
				'findAndReplace',
				'htmlEmbed',
				'selectAll',
				'strikethrough',
				'subscript',
				'superscript',
				'highlight',
				'fontBackgroundColor',
				'imageInsert',
				'specialCharacters',
				'todoList'
			]
		},
    isReadOnly: false,
		language: 'en',
		image: {
			toolbar: [
				'imageTextAlternative',
				'toggleImageCaption',
				'imageStyle:inline',
				'imageStyle:block',
				'imageStyle:side',
				'linkImage'
			]
		},
		table: {
			contentToolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells'
			]
		},
    mention: {
      feeds: [
        {
          marker: '@',
          feed: [],
          minimumCharacters: 0
        }
      ]
    }
  };

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

    this.getAllCompanies();
    this.formComponents = this.transportService.formBuilderData.value;
    this.formTabs = this.formComponents.map(val => val.title);
    let formComps = JSON.parse(JSON.stringify(this.formComponents));
    formComps?.map(form => {
      this.formKeys?.push({[form.key]: FormioUtils.flattenComponents(form?.components, false)})
    })
    this.summarySchemaFields = this.formKeys.flatMap(val => {
      let res = generateKeyCombinations(val)
      return res
    })
    if(this.summarySchemaFields.length > 0) {
      let markers = [...this.summarySchemaFields]
      markers = markers.map(val => {
        val = '@'+ val
        return val
      })
      this.editorConfig.mention.feeds[0].feed = markers
    }
    this.formKeysForViewSchema = this.summarySchemaFields;
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

  inheritParentForm() {
    this.inheritLoader.next(true);
    let data = JSON.parse(JSON.stringify(this.dashboard.inheritSubmoduleData.value));
    data?.formIds?.forEach(value => {
      value.title = value.title + '-' + String(Math.floor(Math.random()*(999-100+1)+100));
      value.key = value.key + '-' + String(Math.floor(Math.random()*(999-100+1)+100));
      FormioUtils.eachComponent(value?.components, (component) => {
        if(component.type == 'select') {
          component.template = component?.template?.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
        }
        if(component.type == 'editgrid') {
          for (const key in component.templates) {
            component.templates[key] = component.templates[key]?.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
          }
        }
      })
    })
    this.formComponents = data?.formIds;
    this.formTabs = data?.formIds?.map(forms => forms.title);
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
    const companyId = {
      value: data?.companyId?.id,
      label: data?.companyId?.title
    }
    const categoryId = {
      value: data?.categoryId?.id,
      label: data?.categoryId?.name
    }
    this.file = data?.image
    this.base64File = data?.image
    const workflows = data?.workFlowId?.stepIds?.map(data => {
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
    const adminUsers = data?.adminUsers?.map(val => {
      return {
        name: val?.fullName,
        id: val?.id,
        control: new FormControl<boolean>(true)
      }
    });
    const viewOnlyUsers = data?.viewOnlyUsers?.map(val => {
      return {
        name: val?.fullName,
        id: val?.id,
        control: new FormControl<boolean>(true)
      }
    })
    const colWidth = data?.layout?.colWidth || "4";
    const code = data?.code + '-' + String(Math.floor(Math.random()*(999-100+1)+100));
    const title = data?.title + '-' + String(Math.floor(Math.random()*(999-100+1)+100));
    this.addForms.setValue(data?.formVisibility?.value || true);
    delete data?.workFlowId;
    delete data?.url;
    delete data?.companyId;
    delete data?.categoryId;
    const finalObject = Object.assign(
      data,
      {workflows: workflows},
      {categoryName: categoryId},
      {companyName: companyId},
      {viewOnlyUsers: viewOnlyUsers},
      {adminUsers: adminUsers},
      {colWidth: colWidth},
      {code: code},
      {title: title}
    )
    this.initSubModuleForm(finalObject);
    this.transportService.saveDraftLocally(finalObject);
    this.transportService.sendFormBuilderData({});
    this.inheritLoader.next(false);
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
          this.emailContent = this.submoduleFromLS.emailTemplate.action;
          this.emailContentNotify = this.submoduleFromLS.emailTemplate.notify;
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
            this.file = this.submoduleFromLS?.file;
            this.emailContent = this.submoduleFromLS.emailTemplate.action;
            this.emailContentNotify = this.submoduleFromLS.emailTemplate.notify;
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
        size: 'l'
      })
      .subscribe());
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
    // this.emailContent = this.dashboard.emailContent;
    // this.emailContentNotify = this.dashboard.emailContentNotify;
    this.saveDialogSubscription.forEach(val => val.unsubscribe())
  }

  confirmEmailTemplate() {
    this.saveDialogSubscription.forEach(val => val.unsubscribe())
  }

  cancelEmailTemplate() {
    this.emailContent = this.dashboard.emailContent;
    this.emailContentNotify = this.dashboard.emailContentNotify;
    this.saveDialogSubscription.forEach(val => val.unsubscribe())
  }

  getAllCompanies() {
    this.dashboard.getAllCompanies(20, 0)
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
    this.dashboard.getAllCategories(20)
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
        Validators.required
      ]), [CodeValidator.createValidator(this.dashboard, 'submodule')]],
      companyName: [item?.companyName?.value ? item?.companyName?.value : item?.companyName || null, Validators.required],
      categoryName: [item?.categoryName?.value ? item?.categoryName?.value : item?.categoryName || null, Validators.required],
      adminUsers: [item?.adminUsers || [], Validators.required],
      viewOnlyUsers: [item?.viewOnlyUsers || [], Validators.required],
      title: [item?.title || null, Validators.compose([Validators.required]), [CodeValidator.createValidator(this.dashboard, 'submodule', 'title')]],
      image: [item?.image || null, Validators.required],
      description: [item?.description || null, Validators.required],
      colWidth: [item?.colWidth || "4"],
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
      title: ['', Validators.compose([Validators.required]), [CodeValidator.createValidator(this.dashboard, 'company', 'title')]],
      groupCode: ['',
      Validators.compose([
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(4)
      ]), [CodeValidator.createValidator(this.dashboard, 'company')]]
    });
    this.companies.push(companyForm)
  }

  getValidityForCompany(i) {
    return (<FormArray>this.companies).controls[i]?.get('title').hasError('required') && (<FormArray>this.companies).controls[i]?.get('title').dirty ;
  }

  getValidityForCompanyCode(i) {
    return ((<FormArray>this.companies).controls[i]?.get('groupCode').hasError('required') ||
    (<FormArray>this.companies).controls[i]?.get('groupCode').hasError('maxlength') ||
    (<FormArray>this.companies).controls[i]?.get('groupCode').hasError('minlength')) &&
    (<FormArray>this.companies).controls[i]?.get('groupCode').dirty
  }

  getValidityForWorkflowStep() {
    return (<FormArray>this.workflows).controls[0]?.get('approverIds')?.hasError('required') && (<FormArray>this.workflows).controls[0]?.get('approverIds')?.touched
  }

  getValidityForCompanyCodeExists(i) {
    return (<FormArray>this.companies).controls[i]?.get('title')?.hasError('codeExists');
  }

  getValidityForCompanyCodeExistsGroup(i) {
    return (<FormArray>this.companies).controls[i]?.get('groupCode')?.hasError('codeExists');
  }

  getValidityForCategory(i) {
    return (<FormArray>this.categories).controls[i].hasError('required') && (<FormArray>this.categories).controls[i].touched;
  }

  getValidityForCategoryCode(i) {
    return (<FormArray>this.categories).controls[i]?.get('name').hasError('codeExists');
  }

  removeCompany(index: number) {
    this.companies.removeAt(index);
  }

  get categories() {
    return this.f["categories"] as FormArray;
  }

  addCategory() {
    const categoryForm = this.fb.group({
      name: ['', Validators.compose([Validators.required, Validators.maxLength(40)]),
      [CodeValidator.createValidator(this.dashboard, 'category')]]
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
    this.transportService.saveDraftLocally({...this.subModuleForm.value, image: this.base64File, file: this.file, emailTemplate: {
      action: this.emailContent,
      notify: this.emailContentNotify,
    }});
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
    setItem(StorageItem.editBreadcrumbs, this.dashboard.items)
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
    this.deafultFormSubmissionDialog = this.deafultFormSubmission;
    this.formComponents[this.defaultFormIndex].defaultData = this.deafultFormSubmission[this.defaultFormIndex]
    this.defaultFormSubscription.forEach(val => val.unsubscribe())
  }

  sendFormForEdit(index: number) {
    this.transportService.isFormEdit.next(true);
    this.transportService.sendFormDataForEdit.next(this.formComponents[index]);
    setItem(StorageItem.editBreadcrumbs, this.dashboard.items)
    this.transportService.saveDraftLocally({...this.subModuleForm.value, image: this.base64File, file: this.file, emailTemplate: {
      action: this.emailContent,
      notify: this.emailContentNotify,
    }});
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
      formVisibility: this.addForms.value,
      colWidth: this.f['colWidth']?.value || "4",
      summarySchema: this.schemaForm.value?.summarySchema?.length > 0 ? this.schemaForm.value?.summarySchema : undefined,
      viewSchema: this.schemaForm.value?.viewSchema[0]?.displayAs ? this.schemaForm.value?.viewSchema : undefined,
      accessType: this.accessTypeValue?.value?.name !== 'disabled' ? this.accessTypeValue?.value?.name : undefined,
      emailTemplate: {
        action: this.emailContent,
        notify: this.emailContentNotify
      }
    }
    if(statusStr) {
      this.isSavingAsDraft.next(true)
    } else {
      this.isCreatingSubModule.next(true)
    }
    if(this.file) {
      if(typeof this.file == 'string') {
        const url = 'uploads' + this.file.split('uploads')[1];
        payload = {...payload, image: url };
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
      size: 'l'
    })
    .subscribe());
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe()
  }
}
