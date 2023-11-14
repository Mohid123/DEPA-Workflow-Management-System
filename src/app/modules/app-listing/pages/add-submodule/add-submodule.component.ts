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
import { StorageItem, getItem, setItem, setItemSession, getItemSession } from 'src/core/utils/local-storage.utils';
import { PolymorpheusContent } from '@tinkoff/ng-polymorpheus';
import { CodeValidator, calculateFileSize, generateKeyCombinations } from 'src/core/utils/utility-functions';
import { MediaUploadService } from 'src/core/core-services/media-upload.service';
import { ApiResponse } from 'src/core/models/api-response.model';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  templateUrl: './add-submodule.component.html',
  styleUrls: ['./add-submodule.component.scss']
})
export class AddSubmoduleComponent implements OnDestroy, OnInit {
  subModuleForm!: FormGroup;
  activeItemIndex = 0;
  topTabIndex = 0;
  activeItemIndexHooks = 0;
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
  eventCodeOnChange: string;
  eventCodeOnLoad: string;
  eventComponent = new FormControl(null)
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
  <head>Action</head>
  <body>
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
  </body>
  `;
  emailContentNotify: any = `
  <head>FYI</head>
  <body>
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
  </body>
  `;
  emailContentCSS: any = `
    body {
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
      position: relative;
      -webkit-text-size-adjust: none;
      background-color: #ffffff;
      color: #718096;
      height: 100%;
      line-height: 1.4;
      margin: 0;
      padding: 0;
      width: 100% !important;
    }

    .wrapper {
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
      position: relative;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
      -premailer-width: 100%;
      background-color: #edf2f7;
      margin: 0;
      padding: 0;
      width: 100%;
    }

    .header {
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
      position: absolute;
        top: -110px;
      left: 40%;
      padding: 50px 0 25px 0;
      text-align: center;
    }

    .content {
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
      position: relative;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
      -premailer-width: 100%;
      margin: 0;
      padding: 0;
      width: 100%;
    }

    .body {
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
      position: relative;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
      -premailer-width: 100%;
      background-color: #edf2f7;
      border-bottom: 1px solid #edf2f7;
      border-top: 1px solid #edf2f7;
      margin: 0;
      padding: 0;
      width: 100%;
      border: hidden !important;
      position: relative;
    }

    .inner-body {
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
      position: relative;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
      -premailer-width: 570px;
      background-color: #ffffff;
      border-color: #e8e5ef;
      border-radius: 2px;
      border-width: 1px;
      box-shadow: 0 2px 0 rgba(0, 0, 150, 0.025), 2px 4px 0 rgba(0, 0, 150, 0.015);
      margin: 70px auto 50px auto;
      padding: 0;
      width: 570px;
      padding: 32px;
    }

    .form-data {
      width: 100%;
      min-height: 100px;
      height: 200px;
      overflow-y: scroll;
      margin-bottom: 20px;
    }

    .form-data ul {
      list-style-type: none;
      margin-left: -40px;
    }

    .form-data ul li {
      font-weight: 600;
      font-size: 18px;
      margin-bottom: 8px;
    }

    .form-data ul li span:first-child {
      font-weight: 500;
    }

    .action {
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
      position: relative;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
      -premailer-width: 100%;
      margin: 30px auto;
      padding: 0;
      text-align: center;
      width: 100%;
      display:flex;
      justify-content: center;
    }

    .action td {
      padding-right: 1rem;
    }

    .button {
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
      position: relative;
      -webkit-text-size-adjust: none;
      border-radius: 4px;
      color: #fff;
      display: inline-block;
      overflow: hidden;
      text-decoration: none;
    }

    .button-primary {
      border-bottom: 8px solid #4CAF50;
      border-left: 18px solid #4CAF50;
      border-right: 18px solid #4CAF50;
      border-top: 8px solid #4CAF50;
      background-color: #4CAF50;
    }

    .button-primary:hover {
      background-color: #4CAF50;
    }

    .button-danger {
      border-bottom: 8px solid #f44336;
      border-left: 18px solid #f44336;
      border-right: 18px solid #f44336;
      border-top: 8px solid #f44336;
      background-color: #f44336;
    }

    .button-danger:hover {
      background-color: #f4433f;
    }

    .content-cell h1 {
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
      position: relative;
      color: #3d4852;
      font-size: 18px;
      font-weight: bold;
      margin-top: 0;
      text-align: left;
    }

    .form-title {
      font-weight: 600;
      font-size: 18px;
      margin-bottom: 8px;
    }

    .form-key {
      font-weight: 500;
    }

    .form-value {
      font-weight: 300;
    }

    .approval-log, .summary-data {
      width: 100%;
    }

    .approval-log tr th, .summary-data tr th {
      background-color: #f2f2f2;
    }

    .approval-log tr th, .approval-log tr td
    .summary-data tr th, .summary-data tr td {
      text-align:center;
    }

    .btn-align {
      text-align: left;
    }
  `;
  emailContentNotifyCSS: any = `
    body {
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
      position: relative;
      -webkit-text-size-adjust: none;
      background-color: #ffffff;
      color: #718096;
      height: 100%;
      line-height: 1.4;
      margin: 0;
      padding: 0;
      width: 100% !important;
    }

    .wrapper {
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
      position: relative;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
      -premailer-width: 100%;
      background-color: #edf2f7;
      margin: 0;
      padding: 0;
      width: 100%;
    }

    .header {
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
      position: absolute;
        top: -110px;
      left: 40%;
      padding: 50px 0 25px 0;
      text-align: center;
    }

    .content {
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
      position: relative;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
      -premailer-width: 100%;
      margin: 0;
      padding: 0;
      width: 100%;
    }

    .body {
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
      position: relative;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
      -premailer-width: 100%;
      background-color: #edf2f7;
      border-bottom: 1px solid #edf2f7;
      border-top: 1px solid #edf2f7;
      margin: 0;
      padding: 0;
      width: 100%;
      border: hidden !important;
      position: relative;
    }

    .inner-body {
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
      position: relative;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
      -premailer-width: 570px;
      background-color: #ffffff;
      border-color: #e8e5ef;
      border-radius: 2px;
      border-width: 1px;
      box-shadow: 0 2px 0 rgba(0, 0, 150, 0.025), 2px 4px 0 rgba(0, 0, 150, 0.015);
      margin: 70px auto 50px auto;
      padding: 0;
      width: 570px;
      padding: 32px;
    }

    .form-data {
      width: 100%;
      min-height: 100px;
      height: 200px;
      overflow-y: scroll;
      margin-bottom: 20px;
    }

    .form-data ul {
      list-style-type: none;
      margin-left: -40px;
    }

    .form-data ul li {
      font-weight: 600;
      font-size: 18px;
      margin-bottom: 8px;
    }

    .form-data ul li span:first-child {
      font-weight: 500;
    }

    .action {
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
      position: relative;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
      -premailer-width: 100%;
      margin: 30px auto;
      padding: 0;
      text-align: center;
      width: 100%;
      display:flex;
      justify-content: center;
    }

    .action td {
      padding-right: 1rem;
    }

    .button {
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
      position: relative;
      -webkit-text-size-adjust: none;
      border-radius: 4px;
      color: #fff;
      display: inline-block;
      overflow: hidden;
      text-decoration: none;
    }

    .button-primary {
      border-bottom: 8px solid #4CAF50;
      border-left: 18px solid #4CAF50;
      border-right: 18px solid #4CAF50;
      border-top: 8px solid #4CAF50;
      background-color: #4CAF50;
    }

    .button-primary:hover {
      background-color: #4CAF50;
    }

    .button-danger {
      border-bottom: 8px solid #f44336;
      border-left: 18px solid #f44336;
      border-right: 18px solid #f44336;
      border-top: 8px solid #f44336;
      background-color: #f44336;
    }

    .button-danger:hover {
      background-color: #f4433f;
    }

    .content-cell h1 {
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
      position: relative;
      color: #3d4852;
      font-size: 18px;
      font-weight: bold;
      margin-top: 0;
      text-align: left;
    }

    .form-title {
      font-weight: 600;
      font-size: 18px;
      margin-bottom: 8px;
    }

    .form-key {
      font-weight: 500;
    }

    .form-value {
      font-weight: 300;
    }

    .approval-log, .summary-data {
      width: 100%;
    }

    .approval-log tr th, .summary-data tr th {
      background-color: #f2f2f2;
    }

    .approval-log tr th, .approval-log tr td
    .summary-data tr th, .summary-data tr td {
      text-align:center;
    }

    .btn-align {
      text-align: left;
    }
  `;
  previewData: any;
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
  editorOptions = {theme: 'vs-dark', language: 'handlebars'};
  cssEditorOptions = {theme: 'vs-dark', language: 'css'};
  jsEditorOptions = {theme: 'vs-dark', language: 'javascript'};
  triggerCode: string = `function x(submission) {
    console.log(submission, "Hello world!");
  }`;
  pdfTempCode: string;
  triggerCodeAfter: string = `function x(submission) {
    console.log(submission, "Hello world!");
  }`

  constructor(
    private fb: FormBuilder,
    public auth: AuthService,
    public transportService: DataTransportService,
    private router: Router,
    private dashboard: DashboardService,
    private activatedRoute: ActivatedRoute,
    private notif: NotificationsService,
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
    private media: MediaUploadService,
    private domSanitizer: DomSanitizer
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
    this.formTabs = this.formComponents?.map(val => val.title);
    let formComps = JSON.parse(JSON.stringify(this.formComponents));
    formComps?.map(form => {
      this.formKeys?.push({[form.key]: FormioUtils.flattenComponents(form?.components, false)})
    })
    this.summarySchemaFields = this.formKeys.flatMap(val => {
      let res = generateKeyCombinations(val)
      return res
    })
    this.formKeysForViewSchema = this.summarySchemaFields;
    // get users for email
    this.search$.pipe(
      switchMap(search => this.dashboard.getAllUsersForListing(this.limit, this.page, search)),takeUntil(this.destroy$))
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

  /**
   * Angular's lifecycle hook that runs once the component is initialized
   */
  ngOnInit(): void {
    let hierarchy = getItem(StorageItem.navHierarchy)?.map(value => value?.caption);
    if(hierarchy?.includes('Material Inspection Report')) {
      this.pdfTempCode = this.dashboard.pdfTemplate
    }
    if(hierarchy?.includes('General Quality Report')) {
      this.pdfTempCode = this.dashboard.pdfTemplateForQR
    }
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

  /**
   * Method to set the preview of the email template
   * @param i number
   */
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

  /**
   * Method to initiate the inheritance of the immediate parent app's data into the child data
   */
  inheritParentForm() {
    this.inheritLoader.next(true);
    let data = JSON.parse(JSON.stringify(this.dashboard.inheritSubmoduleData.value));
    if(data?.formIds?.length > 0) {
      data?.formIds?.forEach(value => {
        value.title = value.title + '-' + String(Math.floor(Math.random()*(999-100+1)+100));
        value.key = value.key + '-' + String(Math.floor(Math.random()*(999-100+1)+100));
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
    }
    else {
      this.formComponents = [{title: '', key: '', display: '', components: []}];
    }
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

  /**
   * Method to ensure HTML tags are properly created and rendered for all form elements that may include them
   * @param value Object | any
   * @returns Sanitized value of the imput
   */
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

  /**
   * Method to set the summary and view schema
   * @param data The data array carrying the summary schema information
   */
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

  /**
   * Method to check that no tow labels overlap or have the same name
   * @returns boolean
   */
  checkIfLabelIsUnique() {
    let unique = new Set(this.schemaForm.controls['viewSchema'].value?.map(data => data?.displayAs));
    if(unique.size !== this.schemaForm.controls['viewSchema'].value?.length) {
      return false
    }
    return true
  }

  /**
   * Getter for the view schema form value
   */
  get viewSchema() {
    return this.schemaForm.controls['viewSchema'] as FormArray;
  }

  /**
   * Method for adding a new form array into the existinmg view schema form
   */
  addViewSchema() {
    const schemaForm = this.fb.group({
      fieldKey: new FormControl(''),
      displayAs: new FormControl(''),
      type: new FormControl(this.selectItems[0])
    });
    this.viewSchema.push(schemaForm)
  }

  /**
   * Method for removing a form array instance at a specified index
   * @param index number
   */
  deleteViewSchema(index: number) {
    this.viewSchema.removeAt(index);
  }

  /**
   * Method to fetch the defualt app workflow from the parent and populate it into the Workflow section
   */
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
          this.emailContentCSS = this.submoduleFromLS.emailTemplate.actionCSS;
          this.emailContentNotify = this.submoduleFromLS.emailTemplate.notify;
          this.emailContentNotifyCSS = this.submoduleFromLS.emailTemplate.notifyCSS;
        }
      }
    });
  }

  /**
   * Method to fetch the defualt app workflow from the child and populate it into the Workflow section
   */
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
            this.emailContentCSS = this.submoduleFromLS.emailTemplate.actionCSS;
            this.emailContentNotify = this.submoduleFromLS.emailTemplate.notify;
            this.emailContentNotifyCSS = this.submoduleFromLS.emailTemplate.notifyCSS;
          }
        })
      }
    });
  }

  /**
   * Method to open the Email Notify users dialog
   * @param content PolymorpheusContent (content with varying shape or type. In this case it is a html template for the dialog)
   * @param fieldArray FormArray
   * @param index number
   */
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

  /**
   * Method to open and render the Email Template dialog (notify and action)
   * @param content PolymorpheusContent (content with varying shape or type. In this case it is a html template for the dialog)
   */
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

  /**
   * Common method to open the Triggers, PDF Template and Summary Schema dalogs
   * @param content PolymorpheusContent (content with varying shape or type. In this case it is a html template for the dialog)
   */
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

  /**
   * Method to initiate search and pass the value to a Subject for further subscription and process
   * @param search string
   */
  onSearchChange(search: string) {
    this.search$.next(search);
  }

  /**
   * Method to validate if emails and email ids are valid based on regex string
   */
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

  /**
   * Method to cancel the email notification users
   */
  cancelEmailNotify() {
    this.workflows.at(this.activeEmailIndex)?.get('emailNotifyTo')?.setValue([]);
    // this.emailContent = this.dashboard.emailContent;
    // this.emailContentNotify = this.dashboard.emailContentNotify;
    this.saveDialogSubscription.forEach(val => val.unsubscribe())
  }

  /**
   * Method to confirm and save the email template in local state before publishing
   */
  confirmEmailTemplate() {
    this.saveDialogSubscription.forEach(val => val.unsubscribe())
  }

  /**
   * @ignore
   */
  cancelEmailTemplate() {
    this.emailContent = this.dashboard.emailContent;
    this.emailContentNotify = this.dashboard.emailContentNotify;
    this.emailContentCSS = this.dashboard.emailContentCSS;
    this.emailContentNotifyCSS = this.dashboard.emailContentNotifyCSS;
    this.saveDialogSubscription.forEach(val => val.unsubscribe())
  }

  /**
   * Method to fetch all companies
   */
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

  /**
   * Method to fetch all categories
   */
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

  /**
   * Method to initialize the submoduole form once the page loads
   * @param item Submodule data Object
   */
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

  /**
   * Method to trigger file selection and validation before upload
   * @param event change or click event to select files
   */
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

  /**
   * Getter for form values and controls of entire submodule form
   */
  get f() {
    return this.subModuleForm.controls
  }

  /**
   * Getter for comapnies form array data and controls
   */
  get companies() {
    return this.f["companies"] as FormArray;
  }

  /**
   * Method for adding a new company to the form array
   */
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

  /**
   * Method for validating the form data of company
   * @param i number
   * @returns boolean baed on whether company item is valid
   */
  getValidityForCompany(i) {
    return (<FormArray>this.companies).controls[i]?.get('title').hasError('required') && (<FormArray>this.companies).controls[i]?.get('title').dirty ;
  }

    /**
   * Method for validating the form data of company code
   * @param i number
   * @returns boolean based on whether company item is valid
   */
  getValidityForCompanyCode(i) {
    return ((<FormArray>this.companies).controls[i]?.get('groupCode').hasError('required') ||
    (<FormArray>this.companies).controls[i]?.get('groupCode').hasError('maxlength') ||
    (<FormArray>this.companies).controls[i]?.get('groupCode').hasError('minlength')) &&
    (<FormArray>this.companies).controls[i]?.get('groupCode').dirty
  }

    /**
   * Method for validating the form data of workflow step
   * @returns boolean based on whether workflow step is valid
   */
  getValidityForWorkflowStep() {
    return (<FormArray>this.workflows).controls[0]?.get('approverIds')?.hasError('required') && (<FormArray>this.workflows).controls[0]?.get('approverIds')?.touched
  }

  /**
   * Method for checking if company code exists
   * @param i number
   * @returns boolean based on whether company item is valid
   */
  getValidityForCompanyCodeExists(i) {
    return (<FormArray>this.companies).controls[i]?.get('title')?.hasError('codeExists');
  }

  /**
   * @ignore
   * @param i 
   * @returns 
   */
  getValidityForCompanyCodeExistsGroup(i) {
    return (<FormArray>this.companies).controls[i]?.get('groupCode')?.hasError('codeExists');
  }

  /**
   * @ignore
   * @param i 
   * @returns 
   */
  getValidityForCategory(i) {
    return (<FormArray>this.categories).controls[i].hasError('required') && (<FormArray>this.categories).controls[i].touched;
  }

  /**
   * @ignore
   * @param i 
   * @returns 
   */
  getValidityForCategoryCode(i) {
    return (<FormArray>this.categories).controls[i]?.get('name').hasError('codeExists');
  }

  /**
   * Method for removing company from form array
   * @param index number
   */
  removeCompany(index: number) {
    this.companies.removeAt(index);
  }

  /**
   * Getter for categories form array
   */
  get categories() {
    return this.f["categories"] as FormArray;
  }

  /**
   * Method for adding new category to form array
   */
  addCategory() {
    const categoryForm = this.fb.group({
      name: ['', Validators.compose([Validators.required, Validators.maxLength(40)]),
      [CodeValidator.createValidator(this.dashboard, 'category')]]
    });
    this.categories.push(categoryForm)
  }

  /**
   * Method for removing category from form array
   * @param index number
   */
  removeCategory(index: number) {
    this.categories.removeAt(index);
  }

  /**
   * Getter for worklfows form array
   */
  get workflows() {
    return this.f['workflows'] as FormArray
  }

  /**
   * Method for adding new workflow step to form array
   */
  addWorkflowStep() {
    const workflowStepForm = this.fb.group({
      condition: ['', Validators.required],
      approverIds: [[], Validators.required],
      emailNotifyTo: [[], Validators.required]
    });
    this.workflows.push(workflowStepForm)
  }

  /**
   * Method for removing workflow step from form array
   * @param index number
   */
  removeWorkflowStep(index: number) {
    this.workflows.removeAt(index);
  }

  /**
   * Method to get list of all approvers in form array
   * @param value array<string>
   * @param index number
   */
  getApproverList(value: string[], index: number) {
    this.workflows.at(index)?.get('approverIds')?.setValue(value);
  }

  /**
   * Method to add a new company if one doesn't exist
   */
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

  /**
   * Method to add a new category if one doesn't exist
   */
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

  /**
   * Method to save data of app in local state on route from form to app
   * @returns void
   */
  saveDraft() {
    this.transportService.isFormEdit.next(false);
    this.transportService.saveDraftLocally({...this.subModuleForm.value, image: this.base64File, file: this.file, emailTemplate: {
      action: this.emailContent,
      actionCSS: this.emailContentCSS,
      notify: this.emailContentNotify,
      notifyCSS: this.emailContentNotifyCSS
    }});
    this.transportService.formBuilderData.next([{title: '', key: '', display: '', components: []}])
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
    setItemSession(StorageItem.editBreadcrumbs, this.dashboard.items)
    setItemSession(StorageItem.approvers, approvers)
    if(this.categoryIdForMatch) {
      this.router.navigate(['/forms/form-builder'], {queryParams: {isParent: true}});
    }
    else {
      this.router.navigate(['/forms/form-builder']);
    }
  }

  /**
   * Method for adding default data to the form/s
   * @param i number
   * @param content PolymorpheusContent (content with varying shape or type. In this case it is a html template for the dialog)
   */
  addDefaultData(i: number, content: PolymorpheusContent<TuiDialogContext>) {
    this.formForDefaultData = this.formComponents[i]
    this.defaultFormIndex = i;
    this.defaultFormSubscription.push(this.dialogs.open(content, {
      dismissible: false,
      closeable: false,
      size: 'l'
    }).subscribe())
  }

  /**
   * Method that detects changes on the form and performs actions subsequently
   * @param event Formio Event
   */
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

  /**
   * Method to confirm the default data submission locally
   */
  confirmDefaultSubmission() {
    this.deafultFormSubmission = this.deafultFormSubmissionDialog;
    this.formComponents[this.defaultFormIndex].defaultData = this.deafultFormSubmission[this.defaultFormIndex];
    this.defaultFormSubscription.forEach(val => val.unsubscribe())
  }

  /**
   * Method to reroute to edit form page and save all data in state
   * @param index number
   */
  sendFormForEdit(index: number) {
    this.transportService.isFormEdit.next(true);
    this.transportService.sendFormDataForEdit.next(this.formComponents[index]);
    setItemSession(StorageItem.editBreadcrumbs, this.dashboard.items)
    this.transportService.saveDraftLocally({...this.subModuleForm.value, image: this.base64File, file: this.file, emailTemplate: {
      action: this.emailContent,
      actionCSS: this.emailContentCSS,
      notify: this.emailContentNotify,
      notifyCSS: this.emailContentNotifyCSS
    }});
    this.router.navigate(['/forms/form-builder']);
  }

  /**
   * Method for deleting form dialog open
   * @param content any
   * @param index number
   */
  deleteFormDialog(content: any, index: number) {
    this.delIndex = index;
    this.dialogs.open(content, {
      dismissible: true,
      closeable: true
    }).pipe(takeUntil(this.destroy$)).subscribe()
  }

  /**
   * Method for removing form from array of forms
   */
  deleteForm() {
    this.formComponents.splice(this.delIndex, 1)
    this.formTabs.splice(this.delIndex, 1)
  }

  /**
   * @ignore
   * @param lang string
   */
  changeLanguage(lang: string) {
    this.language.emit(lang);
  }

  /**
   * @ignore
   * @returns void
   */
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

  /**
   * @ignore
   */
  closeSchemaDialog() {
    this.saveDialogSubscription.forEach(val => val.unsubscribe())
    this.schemaForm?.reset()
    this.schemaSubscription.forEach(val => val.unsubscribe())
  }

  /**
   * Method called to save entire submodule/app data to server
   * @param statusStr number
   * @returns void
   */
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
        actionCSS: this.emailContentCSS,
        notify: this.emailContentNotify,
        notifyCSS: this.emailContentNotifyCSS
      },
      pdfTemplate: this.pdfTempCode || undefined,
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

  /**
   * @ignore
   */
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

  /**
   * @ignore
   */
  cancelSubmodule() {
    this.routeToBasedOnPreviousPage()
  }

  /**
   * Method to validate company and workflows
   * @returns boolean
   */
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

  /**
   * Method to show warning if worklflow users selection is not valid
   * @param index number
   * @returns boolean
   */
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

  /**
   * @ignore
   * @param value 
   * @param index 
   * @returns 
   */
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

  /**
   * Method to add admin users
   * @param users array<string>
   */
  setAdminUsers(users: string[]) {
    this.subModuleForm?.get('adminUsers')?.setValue(users)
  }

   /**
   * Method to add view only users
   * @param users array<string>
   */
  setViewUsers(users: string[]) {
    this.subModuleForm?.get('viewOnlyUsers')?.setValue(users)
  }

  /**
   * Built in Angular Lifecycle method that is run when component or page is destroyed or removed from DOM
   */
  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe()
  }
}
