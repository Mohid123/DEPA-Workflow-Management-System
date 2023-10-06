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

  firstEditorPreview = false;
  secondEditorPreview = false;
  
  emailContent: any = `
  <div class="ck ck-content ck-editor__editable ck-rounded-corners ck-editor__editable_inline ck-blurred" lang="en" dir="ltr" role="textbox" aria-label="Editor editing area: main" contenteditable="true">
  <h1 class="ck-placeholder" data-placeholder="Type your title"><br data-cke-filler="true"></h1>
  <figure class="image ck-widget ck-widget_with-resizer" contenteditable="false" data-placeholder="Type or paste your content here.">
    <img src="https://depa.com/images/logo.png">
    <div class="ck ck-reset_all ck-widget__type-around">
      <div class="ck ck-widget__type-around__button ck-widget__type-around__button_before" title="Insert paragraph before block" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 8">
          <path d="M9.055.263v3.972h-6.77M1 4.216l2-2.038m-2 2 2 2.038"></path>
        </svg>
      </div>
      <div class="ck ck-widget__type-around__button ck-widget__type-around__button_after" title="Insert paragraph after block" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 8">
          <path d="M9.055.263v3.972h-6.77M1 4.216l2-2.038m-2 2 2 2.038"></path>
        </svg>
      </div>
      <div class="ck ck-widget__type-around__fake-caret"></div>
    </div>
    <div class="ck ck-reset_all ck-widget__resizer ck-hidden">
      <div class="ck-widget__resizer__handle ck-widget__resizer__handle-top-left"></div>
      <div class="ck-widget__resizer__handle ck-widget__resizer__handle-top-right"></div>
      <div class="ck-widget__resizer__handle ck-widget__resizer__handle-bottom-right"></div>
      <div class="ck-widget__resizer__handle ck-widget__resizer__handle-bottom-left"></div>
      <div class="ck ck-size-view" style="display: none;"></div>
    </div>
  </figure>
  <figure class="table ck-widget ck-widget_with-selection-handle" contenteditable="false">
    <div class="ck ck-widget__selection-handle">
      <svg class="ck ck-icon ck-reset_all-excluded ck-icon_inherit-color" viewBox="0 0 16 16">
        <path d="M4 0v1H1v3H0V.5A.5.5 0 0 1 .5 0H4zm8 0h3.5a.5.5 0 0 1 .5.5V4h-1V1h-3V0zM4 16H.5a.5.5 0 0 1-.5-.5V12h1v3h3v1zm8 0v-1h3v-3h1v3.5a.5.5 0 0 1-.5.5H12z"></path>
        <path fill-opacity=".256" d="M1 1h14v14H1z"></path>
        <g class="ck-icon__selected-indicator">
          <path d="M7 0h2v1H7V0zM0 7h1v2H0V7zm15 0h1v2h-1V7zm-8 8h2v1H7v-1z"></path>
          <path fill-opacity=".254" d="M1 1h14v14H1z"></path>
        </g>
      </svg>
    </div>
    <table>
      <tbody>
        <tr>
          <td class="ck-editor__editable ck-editor__nested-editable" role="textbox" contenteditable="true">
            <h3 style="margin-left:80px;">Hello!</h3>
            <p style="margin-left:80px;"><br data-cke-filler="true"></p>
            <p style="margin-left:80px;">{{#each formsData}}</p>
            <p style="margin-left:120px;">{{formId.title}}</p>
            <p style="margin-left:160px;">{{@key}} : {{this}}</p>
            <p style="margin-left:160px;">{{@key}} : {{this}}</p>
            <p style="margin-left:80px;">&nbsp;{{/each}}</p>
            <p style="margin-left:80px;"><br data-cke-filler="true"></p>
            <p style="margin-left:80px;"><span style="color:hsl(0,0%,30%);font-family:Arial, Helvetica, sans-serif;">Now it's your turn to execute the workflow. Please perform the necessary action as soon as possible so that the rest of the workflow can be executed.</span></p>
            <figure class="table ck-widget ck-widget_with-selection-handle" contenteditable="false">
              <div class="ck ck-widget__selection-handle">
                <svg class="ck ck-icon ck-reset_all-excluded ck-icon_inherit-color" viewBox="0 0 16 16">
                  <path d="M4 0v1H1v3H0V.5A.5.5 0 0 1 .5 0H4zm8 0h3.5a.5.5 0 0 1 .5.5V4h-1V1h-3V0zM4 16H.5a.5.5 0 0 1-.5-.5V12h1v3h3v1zm8 0v-1h3v-3h1v3.5a.5.5 0 0 1-.5.5H12z"></path>
                  <path fill-opacity=".256" d="M1 1h14v14H1z"></path>
                  <g class="ck-icon__selected-indicator">
                    <path d="M7 0h2v1H7V0zM0 7h1v2H0V7zm15 0h1v2h-1V7zm-8 8h2v1H7v-1z"></path>
                    <path fill-opacity=".254" d="M1 1h14v14H1z"></path>
                  </g>
                </svg>
              </div>
              <table>
                <tbody>
                  <tr>
                    <th class="ck-editor__editable ck-editor__nested-editable" role="textbox" contenteditable="true">
                      <p style="text-align:center;"><a href="https://depa-frontend.pages.dev/email-submission?submissionId={{submissionId}}&amp;stepId={{stepId}}&amp;userId={{userId}}&amp;isApproved=true"><span style="color:hsl( 120, 100%, 25% );">Approve&nbsp;</span></a><span style="color:hsl( 120, 100%, 25% );"> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;</span><a href="https://depa-frontend.pages.dev/email-submission?submissionId={{submissionId}}&amp;stepId={{stepId}}&amp;userId={{userId}}&amp;isApproved="><span style="color:hsl(0, 75%, 60%);">Reject&nbsp;</span></a></p>
                    </th>
                  </tr>
                </tbody>
              </table>
              <div class="ck ck-reset_all ck-widget__type-around">
                <div class="ck ck-widget__type-around__button ck-widget__type-around__button_before" title="Insert paragraph before block" aria-hidden="true">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 8">
                    <path d="M9.055.263v3.972h-6.77M1 4.216l2-2.038m-2 2 2 2.038"></path>
                  </svg>
                </div>
                <div class="ck ck-widget__type-around__button ck-widget__type-around__button_after" title="Insert paragraph after block" aria-hidden="true">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 8">
                    <path d="M9.055.263v3.972h-6.77M1 4.216l2-2.038m-2 2 2 2.038"></path>
                  </svg>
                </div>
                <div class="ck ck-widget__type-around__fake-caret"></div>
              </div>
            </figure>
            <p style="margin-left:80px;"><span style="color:hsl(0,0%,30%);font-family:Arial, Helvetica, sans-serif;">Regards, DEPA Group</span></p>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="ck ck-reset_all ck-widget__type-around">
      <div class="ck ck-widget__type-around__button ck-widget__type-around__button_before" title="Insert paragraph before block" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 8">
          <path d="M9.055.263v3.972h-6.77M1 4.216l2-2.038m-2 2 2 2.038"></path>
        </svg>
      </div>
      <div class="ck ck-widget__type-around__button ck-widget__type-around__button_after" title="Insert paragraph after block" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 8">
          <path d="M9.055.263v3.972h-6.77M1 4.216l2-2.038m-2 2 2 2.038"></path>
        </svg>
      </div>
      <div class="ck ck-widget__type-around__fake-caret"></div>
    </div>
  </figure>
</div>
  `;
  emailContentNotify: any = `
  <div class="ck ck-content ck-editor__editable ck-rounded-corners ck-editor__editable_inline ck-blurred" lang="en" dir="ltr" role="textbox" aria-label="Editor editing area: main" contenteditable="true">
  <h1 class="ck-placeholder" data-placeholder="Type your title"><br data-cke-filler="true"></h1>
  <figure class="image ck-widget ck-widget_with-resizer" contenteditable="false" data-placeholder="Type or paste your content here.">
    <img src="https://depa.com/images/logo.png">
    <div class="ck ck-reset_all ck-widget__type-around">
      <div class="ck ck-widget__type-around__button ck-widget__type-around__button_before" title="Insert paragraph before block" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 8">
          <path d="M9.055.263v3.972h-6.77M1 4.216l2-2.038m-2 2 2 2.038"></path>
        </svg>
      </div>
      <div class="ck ck-widget__type-around__button ck-widget__type-around__button_after" title="Insert paragraph after block" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 8">
          <path d="M9.055.263v3.972h-6.77M1 4.216l2-2.038m-2 2 2 2.038"></path>
        </svg>
      </div>
      <div class="ck ck-widget__type-around__fake-caret"></div>
    </div>
    <div class="ck ck-reset_all ck-widget__resizer ck-hidden">
      <div class="ck-widget__resizer__handle ck-widget__resizer__handle-top-left"></div>
      <div class="ck-widget__resizer__handle ck-widget__resizer__handle-top-right"></div>
      <div class="ck-widget__resizer__handle ck-widget__resizer__handle-bottom-right"></div>
      <div class="ck-widget__resizer__handle ck-widget__resizer__handle-bottom-left"></div>
      <div class="ck ck-size-view" style="display: none;"></div>
    </div>
  </figure>
  <figure class="table ck-widget ck-widget_with-selection-handle" contenteditable="false">
    <div class="ck ck-widget__selection-handle">
      <svg class="ck ck-icon ck-reset_all-excluded ck-icon_inherit-color" viewBox="0 0 16 16">
        <path d="M4 0v1H1v3H0V.5A.5.5 0 0 1 .5 0H4zm8 0h3.5a.5.5 0 0 1 .5.5V4h-1V1h-3V0zM4 16H.5a.5.5 0 0 1-.5-.5V12h1v3h3v1zm8 0v-1h3v-3h1v3.5a.5.5 0 0 1-.5.5H12z"></path>
        <path fill-opacity=".256" d="M1 1h14v14H1z"></path>
        <g class="ck-icon__selected-indicator">
          <path d="M7 0h2v1H7V0zM0 7h1v2H0V7zm15 0h1v2h-1V7zm-8 8h2v1H7v-1z"></path>
          <path fill-opacity=".254" d="M1 1h14v14H1z"></path>
        </g>
      </svg>
    </div>
    <table>
      <tbody>
        <tr>
          <td class="ck-editor__editable ck-editor__nested-editable" role="textbox" contenteditable="true">
            <h3 style="margin-left:80px;">Hello!</h3>
            <p style="margin-left:80px;"><br data-cke-filler="true"></p>
            <p style="margin-left:80px;">{{#each formsData}}</p>
            <p style="margin-left:120px;">{{formId.title}}</p>
            <p style="margin-left:160px;">{{@key}} : {{this}}</p>
            <p style="margin-left:160px;">{{@key}} : {{this}}</p>
            <p style="margin-left:80px;">&nbsp;{{/each}}</p>
            <p style="margin-left:80px;"><br data-cke-filler="true"></p>
            <p style="margin-left:80px;"><span style="color:hsl(0,0%,30%);font-family:Arial, Helvetica, sans-serif;">Now it's your turn to execute the workflow. Please perform the necessary action as soon as possible so that the rest of the workflow can be executed.</span></p>
            <p style="margin-left:80px;"><span style="color:hsl(0,0%,30%);font-family:Arial, Helvetica, sans-serif;">Regards, DEPA Group</span></p>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="ck ck-reset_all ck-widget__type-around">
      <div class="ck ck-widget__type-around__button ck-widget__type-around__button_before" title="Insert paragraph before block" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 8">
          <path d="M9.055.263v3.972h-6.77M1 4.216l2-2.038m-2 2 2 2.038"></path>
        </svg>
      </div>
      <div class="ck ck-widget__type-around__button ck-widget__type-around__button_after" title="Insert paragraph after block" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 8">
          <path d="M9.055.263v3.972h-6.77M1 4.216l2-2.038m-2 2 2 2.038"></path>
        </svg>
      </div>
      <div class="ck ck-widget__type-around__fake-caret"></div>
    </div>
  </figure>
</div>
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

  // applyStyles() {
  //   const styles = `
  //     <style>
  //       body {
  //         box-sizing: border-box;
  //         font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
  //         position: relative;
  //         -webkit-text-size-adjust: none;
  //         background-color: #ffffff;
  //         color: #718096;
  //         height: 100%;
  //         line-height: 1.4;
  //         margin: 0;
  //         padding: 0;
  //         width: 100% !important;
  //     }

  //     .wrapper {
  //         box-sizing: border-box;
  //         font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
  //         position: relative;
  //         -premailer-cellpadding: 0;
  //         -premailer-cellspacing: 0;
  //         -premailer-width: 100%;
  //         background-color: #edf2f7;
  //         margin: 0;
  //         padding: 0;
  //         width: 100%;
  //     }

  //     .header {
  //         box-sizing: border-box;
  //         font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
  //         position: absolute;
  //         top: -110px;
  //         left: 40%;
  //         padding: 50px 0 25px 0;
  //         text-align: center;
  //     }

  //     .content {
  //         box-sizing: border-box;
  //         font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
  //         position: relative;
  //         -premailer-cellpadding: 0;
  //         -premailer-cellspacing: 0;
  //         -premailer-width: 100%;
  //         margin: 0;
  //         padding: 0;
  //         width: 100%;
  //     }

  //     .body {
  //         box-sizing: border-box;
  //         font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
  //         position: relative;
  //         -premailer-cellpadding: 0;
  //         -premailer-cellspacing: 0;
  //         -premailer-width: 100%;
  //         background-color: #edf2f7;
  //         border-bottom: 1px solid #edf2f7;
  //         border-top: 1px solid #edf2f7;
  //         margin: 0;
  //         padding: 0;
  //         width: 100%;
  //         border: hidden !important;
  //         position: relative;
  //     }

  //     .inner-body {
  //         box-sizing: border-box;
  //         font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
  //         position: relative;
  //         -premailer-cellpadding: 0;
  //         -premailer-cellspacing: 0;
  //         -premailer-width: 570px;
  //         background-color: #ffffff;
  //         border-color: #e8e5ef;
  //         border-radius: 2px;
  //         border-width: 1px;
  //         box-shadow: 0 2px 0 rgba(0, 0, 150, 0.025), 2px 4px 0 rgba(0, 0, 150, 0.015);
  //         margin: 70px auto 50px auto;
  //         padding: 0;
  //         width: 570px;
  //         padding: 32px;
  //     }

  //     .form-data {
  //         width: 100%;
  //         min-height: 100px;
  //         height: 200px;
  //         overflow-y: scroll;
  //         margin-bottom: 20px;
  //     }

  //     .form-data ul {
  //         list-style-type: none;
  //         margin-left: -40px;
  //     }

  //     .form-data ul li {
  //         font-weight: 600;
  //         font-size: 18px;
  //         margin-bottom: 8px;
  //     }

  //     .form-data ul li span:first-child {
  //         font-weight: 500;
  //     }

  //     .action {
  //         box-sizing: border-box;
  //         font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
  //         position: relative;
  //         -premailer-cellpadding: 0;
  //         -premailer-cellspacing: 0;
  //         -premailer-width: 100%;
  //         margin: 30px auto;
  //         padding: 0;
  //         text-align: center;
  //         width: 100%;
  //         display:flex;
  //         justify-content: center;
  //       }

  //       .action td {
  //           padding-right: 1rem;
  //       }

  //       .button {
  //           box-sizing: border-box;
  //           font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
  //           position: relative;
  //           -webkit-text-size-adjust: none;
  //           border-radius: 4px;
  //           color: #fff;
  //           display: inline-block;
  //           overflow: hidden;
  //           text-decoration: none;
  //       }

  //       .button-primary {
  //         border-bottom: 8px solid #4CAF50;
  //         border-left: 18px solid #4CAF50;
  //         border-right: 18px solid #4CAF50;
  //         border-top: 8px solid #4CAF50;
  //         background-color: #4CAF50;
  //       }

  //       .button-primary:hover {
  //         background-color: #45a049;
  //       }

  //       .button-danger {
  //         border-bottom: 8px solid #f44336;
  //         border-left: 18px solid #f44336;
  //         border-right: 18px solid #f44336;
  //         border-top: 8px solid #f44336;
  //         background-color: #f44336;
  //       }

  //       .button-danger:hover {
  //         background-color: #d32f2f;
  //       }

  //       .content-cell h1 {
  //         box-sizing: border-box;
  //         font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
  //         position: relative;
  //         color: #3d4852;
  //         font-size: 18px;
  //         font-weight: bold;
  //         margin-top: 0;
  //         text-align: left;
  //       }

  //       .form-title {
  //         font-weight: 600;
  //         font-size: 18px;
  //         margin-bottom: 8px;
  //       }

  //       .form-key {
  //         font-weight: 500;
  //       }

  //       .form-value {
  //         font-weight: 300;
  //       }
  //     </style>
      
  //   `;
  //   this.emailContent = this.sanitizer.bypassSecurityTrustHtml(styles + this.emailContent);
  // }

  switchToReadOnly() {
    this.firstEditorPreview = true;
    let toolbar = document.getElementsByClassName('ck-toolbar');
    toolbar[0].classList.add('hidden');
    this.editor.disabled = true
  }

  switchToReadOnly2() {
    this.secondEditorPreview = true
    let toolbar = document.getElementsByClassName('ck-toolbar');
    toolbar[1].classList.add('hidden');
    this.editor2.disabled = true;
  }

  switchToEditor() {
    this.firstEditorPreview = false;
    let toolbar = document.getElementsByClassName('ck-toolbar');
    toolbar[0].classList.remove('hidden');
    this.editor.disabled = false
  }

  switchToEditor2() {
    let toolbar = document.getElementsByClassName('ck-toolbar');
    toolbar[1].classList.remove('hidden');
    this.editor2.disabled = false;
    this.secondEditorPreview = false;
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
