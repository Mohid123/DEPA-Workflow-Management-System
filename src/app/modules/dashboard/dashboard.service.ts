import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TuiNotification } from '@taiga-ui/core';
import { BehaviorSubject, Observable, Subject, map, shareReplay } from 'rxjs';
import { ApiService } from 'src/core/core-services/api.service';
import { NotificationsService } from 'src/core/core-services/notifications.service';
import { ApiResponse } from 'src/core/models/api-response.model';
import { Module } from 'src/core/models/module.model';
import { User } from 'src/core/models/user.model';
import { StorageItem, setItem, setItemSession } from 'src/core/utils/local-storage.utils';

/**
 * Interface for Breadcrumb navigation
 */
interface BreadCrumbs {
  /**
   * breadcrumb caption
   */
  caption: string,
  code?: string

  /**
   * The route link or path to enable navigation
   */
  routerLink: string
}

/**
 * Dashboard service that handles data manipulation and api handling related to the dashboard module
 */
@Injectable({
  providedIn: 'root'
})

export class DashboardService extends ApiService<any> {

  creatingModule = new Subject<boolean>();

  moduleEditData = new BehaviorSubject<any>(null);

  submissionId = new BehaviorSubject<any>('');

  public excludeIdEmitter = new EventEmitter();

  actionComplete = new EventEmitter();

  submissionPendingDone = new EventEmitter();

  emailContent: string = `
  <head></head>
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
  emailContentNotify: string = `
  <head></head>
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

  emailContentCSS: string = `
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
  emailContentNotifyCSS: string = `
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

  pdfTemplate: string = `function generatePDFString(submission, dashboard, progress, logs) {
    const documentDefinition = {}
    return documentDefinition
  }
  `;

  pdfTemplateForQR: string = `function generatePDFString(submission, dashboard, progress, logs) {
    const documentDefinition = {}
    return documentDefinition
  }`

  /**
   * Breadcrumb array to display
   */
  items: BreadCrumbs[] = [];
  tempItems = new EventEmitter<BreadCrumbs[]>();
  previousRoute: string;
  id: string;
  inheritSubmoduleData: BehaviorSubject<any> = new BehaviorSubject({});
  fetchedNewSubmissions = new EventEmitter<boolean>()

  /**
   * Uses HttpClient as an override method that asserts that function it describes is in the parent or base class i.e http methods inside the Api Service
   * @param http Performs HTTP requests.
   */
  constructor(protected override http: HttpClient, private notif: NotificationsService) {
    super(http)
    this.excludeIdEmitter.subscribe(val => {
      this.id = val
    })
  }

  /**
   * Handles the dynamic creation of breadcrumbs when route changes
   * @param route Provides access to information about a route associated with a component that is loaded in an outlet.
   * @param routerLink The route path
   * @param breadcrumbs Array of breadcrumbs
   * @returns {BreadCrumbs[]} An array of breadcrumbs
   */
  public createBreadcrumbs(route: ActivatedRoute, routerLink: string = '', breadcrumbs: BreadCrumbs[] = []) {
    const children: ActivatedRoute[] = route.children;
    if (children.length === 0) {
      return breadcrumbs;
    }
    for (const child of children) {
      const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
      if (routeURL !== '') {
        routerLink += `/${routeURL}`;
      }
      const caption = child.snapshot.data['breadcrumb']?.replace(/[_-]/g, ' ');
      if (['Dashboard', 'Add', 'Edit', 'Create', 'Categories', 'Companies', 'Users', 'Profile']?.some(val => caption?.includes(val))) {
        breadcrumbs.push({caption, routerLink});
      }
      this.createBreadcrumbs(child, routerLink, breadcrumbs);
    }
    return breadcrumbs
  }

  /**
   * Get method for fetching dashbaord page apps
   * @returns {Observable<ApiResponse>} Returns an observable array with category and corresponding module data
   */
  getDashboardApps(): Observable<ApiResponse<any>> {
    return this.get(`/dashboard`).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message || 'Failed to fetch data', 'Get dashboard apps', TuiNotification.Error)
        }
      }
    }))
  }

  /**
   * Method for fetching pending submissions on the currently logged in user
   * @returns Observable Array of Pending Submissions
   */
  getPendingSubmissions(): Observable<ApiResponse<any>> {
    return this.get('/user/pendings').pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message || 'Failed to fetch data', 'Get pending submissions', TuiNotification.Error)
        }
      }
    }))
  }

  /**
   * Method for validating if module code already exists
   * @param codeValue
   * @param model 
   * @param key 
   * @param typedVal 
   * @returns Observable of fetch call for module code validation
   */
  validateModuleCode(codeValue: string, model: string, key?: string, typedVal?: string): Observable<ApiResponse<any>> {
    let params = {
      model: model,
      value: codeValue || typedVal,
      key: key ? key : undefined,
      excludeId: this.id ? this.id : undefined
    }
    if(!params.key) {
      delete params.key
    }
    if(!params.excludeId) {
      delete params.excludeId
    }
    return this.get(`/validate/unique`, params)
  }

  /**
   * Method for validating if form code/slug/key already exists
   * @param codeValue string
   * @returns 
   */
  validateFormCode(codeValue: string): Observable<ApiResponse<any>> {
    let params = {key: codeValue}
    return this.get(`/forms/validate-key`, params)
  }

  /**
   * Get child app or module in relationship to it's parent module
   * @param moduleID string
   * @returns Observable of Submodule
   */
  getSubModuleByModule(moduleID: string): Observable<ApiResponse<any>> {
    return this.get(`/module/${moduleID}`).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        return res.data
      }
      else {
        if (![401, 403].includes(res.errors[0].code) || res.errors[0].code !== undefined) {
          return this.notif.displayNotification(res.errors[0]?.error?.message, 'Get apps', TuiNotification.Error)
        }
      }
    }))
  }

  /**
   * Method for fetching all users
   * @param limit number
   * @param page number
   * @param name string
   * @param role string
   * @param sortBy string
   * @returns 
   */
  getAllUsers(limit: number, page: number, name?: string, role?: string, sortBy?: string): Observable<ApiResponse<any>> {
    let params: any = {
      limit: limit,
      page: page+ 1,
      fullName: name ? name : ' '
    }
    if(name) {
      params = {
        limit: limit,
        fullName: name ? name : ' '
      }
    }
    return this.get(`/users`, params).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        return res.data?.results?.map((value: User) => {
          return {
            id: value?.id,
            name: value?.fullName,
            control: new FormControl<boolean>(false),
            roles: value?.roles
          }
        })
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message || 'Failed to fetch users', 'Get Users', TuiNotification.Error)
        }
      }
    }))
  }

  /**
   * @ignore
   * @param limit number
   * @param page number
   * @param name string
   * @param role string
   * @param sortBy string
   * @returns 
   */
  getAllUsersForListing(limit: number, page?: number, name?: string, role?: string, sortBy?: string): Observable<ApiResponse<any>> {
    let params: any = {
      limit: limit,
      page: page+ 1,
      fullName: name ? name : ' '
    }
    if(name) {
      params = {
        limit: limit,
        fullName: name ? name : ' '
      }
    }
    return this.get(`/users`, params).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message || 'Failed to fetch users', 'Get Users', TuiNotification.Error)
        }
      }
    }))
  }

  /**
   * Method for fetching only Admin Users
   * @param limit number
   * @param page number
   * @param name string
   * @param role string
   * @param sortBy string
   * @returns 
   */
  getAllAdminUsers(limit: number, page: number, name?: string, role?: string, sortBy?: string): Observable<ApiResponse<any>> {
    let params: any = {
      limit: limit,
      page: page+ 1,
      fullName: name ? name : ' '
    }
    if(name) {
      params = {
        limit: limit,
        fullName: name ? name : ' '
      }
    }
    return this.get(`/users/admins`, params).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        return res.data?.results?.map((value: User) => {
          return {
            id: value?.id,
            name: value?.fullName,
            control: new FormControl<boolean>(false)
          }
        })
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message || 'Failed to fetch users', 'Get Users', TuiNotification.Error)
        }
      }
    }))
  }

  /**
   * @ignore
   * @param limit number
   * @param page number
   * @param name 
   * @param role 
   * @param sortBy 
   * @returns 
   */
  getAdminUsers(limit: number, page?: number, name?: string, role?: string, sortBy?: string): Observable<ApiResponse<any>> {
    let params: any = {
      limit: limit,
      page: page+ 1,
      fullName: name ? name : ' '
    }
    if(name) {
      params = {
        limit: limit,
        fullName: name ? name : ' '
      }
    }
    return this.get(`/users/admins`, params).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message || 'Failed to fetch users', 'Get Users', TuiNotification.Error)
        }
      }
    }))
  }

  /**
   * Method for updating user
   * @param id string
   * @param payload Object
   * @returns Observable of updated user object
   */
  updateUser(id: string, payload: any): Observable<ApiResponse<any>> {
    return this.patch(`/users/${id}`, payload).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.notif.displayNotification('User updated successfully', 'Update User', TuiNotification.Success);
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message, 'Update User', TuiNotification.Error)
        }
      }
    }))
  }

  /**
   * Method for deleting user
   * @param id string
   * @returns Observable with confirmation object of delete status
   */
  deleteUser(id: string): Observable<ApiResponse<any>> {
    return this.delete(`/users/${id}`).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.notif.displayNotification('User removed', 'Remove User', TuiNotification.Success);
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message, 'Delete User', TuiNotification.Error)
        }
      }
    }))
  }

  /**
   * Method for adding a new user
   * @param payload Object
   * @returns Observable of user object
   */
  addNewUser(payload: any): Observable<ApiResponse<any>> {
    return this.post(`/users`, payload).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.notif.displayNotification('User created', 'Add User', TuiNotification.Success);
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message, 'Add User', TuiNotification.Error)
        }
      }
    }))
  }

  /**
   * Method for fetching companies
   * @param limit number
   * @param page number
   * @returns Observable array containg data of companies
   */
  getAllCompanies(limit: number, page: number): Observable<ApiResponse<any>> {
    const params: any = {
      limit: limit,
      page: page+ 1
    }
    return this.get(`/companies`, params).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message ||'Failed to fetch data', 'Fetch companies', TuiNotification.Error);
        }
      }
    }))
  }

  /**
   * Method for adding a new company
   * @param payload company object payload
   * @returns Observable of company added
   */
  addCompany(payload: any): Observable<ApiResponse<any>> {
    return this.post(`/companies`, payload).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.notif.displayNotification('New company added', 'Add company', TuiNotification.Success);
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message, 'Add company', TuiNotification.Error);
        }
      }
    }))
  }

  /**
   * Method for updating company data
   * @param payload company object
   * @param companyId string
   * @returns updated company data
   */
  updateCompany(payload: any, companyId: string): Observable<ApiResponse<any>> {
    return this.patch(`/companies/${companyId}`, payload).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.notif.displayNotification('Company updated', 'Update Company', TuiNotification.Success);
        return res?.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code))
        return this.notif.displayNotification(res.errors[0]?.error?.message, 'Update Company', TuiNotification.Error)
      }
    }))
  }

  /**
   * Method for deleting a company
   * @param companyId stirng
   * @returns Observable with confirmation of deleted status of company
   */
  deleteCompany(companyId: string): Observable<ApiResponse<any>> {
    return this.delete(`/companies/${companyId}`).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.notif.displayNotification('Company deleted', 'Delete Company', TuiNotification.Success);
        return res?.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code))
        return this.notif.displayNotification(res.errors[0]?.error?.message, 'Delete Category', TuiNotification.Error)
      }
    }))
  }

  /**
   * Method for creating a new app or module
   * @param payload Module object
   * @returns Module object as Observable after creation and storage
   */
  createModule(payload: Module): Observable<ApiResponse<any>> {
    this.creatingModule.next(true);
    return this.post(`/modules`, payload).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.creatingModule.next(false)
        return res.data
      }
      else {
        this.creatingModule.next(false);
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message, 'Create Module', TuiNotification.Error)
        }
      }
    }))
  }

  /**
   * Method for deleting module
   * @param moduleID string
   * @returns Observable with confirmation of deleted status of module/app
   */
  deleteModule(moduleID: string): Observable<ApiResponse<any>> {
    return this.delete(`/modules/${moduleID}`).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.notif.displayNotification('Module removed successfully', 'Delete Module', TuiNotification.Success);
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message ||'Failed to delete module', 'Delete Module', TuiNotification.Error);
        }
      }
    }))
  }

  /**
   * Method for fetching module by id
   * @param moduleID string
   * @returns Observable Module Object
   */
  getModuleByID(moduleID: string): Observable<ApiResponse<any>> {
    return this.get(`/modules/${moduleID}`).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        return res.data;
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message ||'Failed to fetch module', 'Get Module', TuiNotification.Error);
        }
      }
    }))
  }

  /**
   * Method for fetching all modules
   * @returns Observable array of modules
   */
  getAllModules(): Observable<ApiResponse<any>> {
    // const params: any = {
    //   limit: limit,
    //   page: page,
    //   ...queryParams
    // }
    return this.get(`/modules`).pipe(map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message, 'Get Modules', TuiNotification.Error);
        }
      }
    }))
  }

  /**
   * @ignore
   * @param moduleID 
   * @returns 
   */
  getModuleByIDForEditModule(moduleID: string): Observable<ApiResponse<any>> {
    return this.get(`/modules/${moduleID}`).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.moduleEditData.next(res.data)
        return res.data;
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message ||'Failed to fetch module', 'Get Module', TuiNotification.Error);
        }
      }
    }))
  }

  /**
   * Method for updating a module/app
   * @param moduleID string
   * @param payload module object
   * @returns updated module object
   */
  editModule(moduleID: string, payload: any): Observable<ApiResponse<any>> {
    this.creatingModule.next(true);
    return this.patch(`/modules/${moduleID}`, payload).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.creatingModule.next(false)
        return res.data
      }
      else {
        this.creatingModule.next(false)
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message, 'Create Module', TuiNotification.Error)
        }
      }
    }))
  }

  /**
   * Method for fetching only the module from the parent app
   * @param moduleID string
   * @returns The workflow attached to the parent module
   */
  getWorkflowFromModule(moduleID: string): Observable<ApiResponse<any>> {
    return this.get(`/modules/${moduleID}`).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        // this.moduleEditData.next(res.data);
        const response = res.data?.workFlowId?.stepIds?.map(data => {
          return {
            approverIds: data?.approverIds?.map(ids => {
              return {
                name: ids?.fullName,
                id: ids?.id,
                control: new FormControl<boolean>(true)
              }
            }),
            condition: data?.condition,
            emailNotifyTo: data?.emailNotifyToId?.notifyUsers
          }
        });
        return response;
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message ||'Failed to fetch module', 'Get Module', TuiNotification.Error);
        }
      }
    }))
  }

  /**
   * Method for fetching the workflow from the submodule
   * @param moduleID string
   * @returns The workflow attached to the child module/s
   */
  getWorkflowFromSubModule(moduleID: string): Observable<ApiResponse<any>> {
    return this.get(`/subModules/${moduleID}`).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.inheritSubmoduleData.next(res.data);
        const response = res.data?.workFlowId?.stepIds?.map(data => {
          return {
            approverIds: data?.approverIds?.map(ids => {
              return {
                name: ids?.fullName,
                id: ids?.id,
                control: new FormControl<boolean>(true)
              }
            }),
            condition: data?.condition,
            emailNotifyTo: data?.emailNotifyToId?.notifyUsers
          }
        });
        return Object.assign({response, categoryId: res.data?.categoryId?.id});
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message ||'Failed to fetch module', 'Get Module', TuiNotification.Error);
        }
      }
    }))
  }

  /**
   * Method for creating a submodule i.e a child app inside a parent app/module
   * @param payload Object
   * @returns 
   */
  createSubModule(payload: any): Observable<ApiResponse<any>> {
    this.creatingModule.next(true);
    return this.post(`/subModules`, payload).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.creatingModule.next(false);
        this.notif.displayNotification('App created successfully', 'Create App', TuiNotification.Success);
        return res.data
      }
      else {
        this.creatingModule.next(false);
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message ||'Failed to create app', 'Create App', TuiNotification.Error);
        }
      }
    }))
  }

  /**
   * Method for deleting the submodule/child app
   * @param id string
   * @returns 
   */
  deleteSubModule(id: string): Observable<ApiResponse<any>> {
    return this.delete(`/subModules/${id}`).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.notif.displayNotification('App removed successfully', 'Delete App', TuiNotification.Success);
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message ||'Failed to remove app', 'Delete App', TuiNotification.Error);
        }
      }
    }))
  }

  /**
   * Method for fetching child app by it's mongo ID
   * @param submodID string
   * @param extractDefaults check for fetching data inside the form field on add submission page
   * @returns 
   */
  getSubModuleByID(submodID: string, extractDefaults?: boolean): Observable<ApiResponse<any>> {
    let params: any = {
      extractDefaults: extractDefaults
    }
    if(!extractDefaults) {
      delete params.extractDefaults
    }
    return this.get(`/subModules/${submodID}`, params).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message, 'Fetch App', TuiNotification.Error);
        }
      }
    }))
  }

  /**
   * Method for fetching module/app by it's slug name
   * @param slugName 
   * @returns 
   */
  getModulesBySlugName(slugName: string): Observable<ApiResponse<any>> {
    return this.get(`/modules/slug/${slugName}`).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message, 'Get Module by Slug Name', TuiNotification.Error)
        }
      }
    }))
  }

 /**
   * Method for fetching child app by it's slug name
   * @param slugName 
   * @returns 
   */
  getSubModuleBySlugName(slugName: string): Observable<ApiResponse<any>> {
    return this.get(`/subModules/slug/${slugName}`).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message, 'Get App', TuiNotification.Error)
        }
      }
    }))
  }

  /**
   * Method for fetching child app by the slug of it's parent
   * @param moduleSlug Parent app slug/key/code
   * @param limit number
   * @param page number
   * @param queryParams 
   * @returns 
   */
  getSubModuleByModuleSlug(moduleSlug: string, limit: any, page: any, queryParams?: any): Observable<ApiResponse<any>> {
    const params: any = {
      limit: limit,
      page: page,
      ...queryParams
    }
    if(queryParams?.search) {
      delete params?.page
    }
    return this.get(`/module/slug/${moduleSlug}`, params).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        const hierarchy = res.data?.navHierarchy?.map(val => {
          return {
            caption: val?.title,
            code: val?.code,
            routerLink: val?.id
          }
        })
        setItemSession(StorageItem.navHierarchy, hierarchy)
        this.tempItems.emit(hierarchy);
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message, 'Get apps', TuiNotification.Error)
        }
      }
    }))
  }

  /**
   * Method for updating child app by id
   * @param id string
   * @param payload Object
   * @returns Observable of updated submodule/ child app
   */
  updateSubModule(id: string, payload: any): Observable<ApiResponse<any>> {
    return this.patch(`/subModules/${id}`, payload).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.notif.displayNotification('App updated', 'Update app', TuiNotification.Success)
        return res.data
      }
      else {
        this.notif.displayNotification(res.errors[0]?.error?.message, 'Update app', TuiNotification.Error)
      }
    }))
  }

  /**
   * Method for fetching all categories
   * @param limit number 
   * @returns Observable of array of categories
   */
  getAllCategories(limit: number): Observable<ApiResponse<any>> {
    const params: any = {
      limit: limit
    }
    return this.get(`/categories`, params).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message, 'Get categories', TuiNotification.Error)
        }
      }
    }))
  }

  /**
   * Method for creating a new category
   * @param category Object
   * @returns Observable of Category
   */
  addCategory(category: {name: string}): Observable<ApiResponse<any>> {
    return this.post('/categories', category).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message, 'Add new category', TuiNotification.Error)
        }
      }
    }))
  }

  /**
   * Method for updating category
   * @param category Object
   * @param id string
   * @returns Observable of Updated Category
   */
  editCategory(category: {name: string}, id: string): Observable<ApiResponse<any>> {
    return this.patch(`/categories/${id}`, category).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message, 'Edit category', TuiNotification.Error)
        }
      }
    }))
  }

  /**
   * Method for deleting category
   * @param id 
   * @returns 
   */
  deleteCategory(id: string): Observable<ApiResponse<any>> {
    return this.delete(`/categories/${id}`).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res.errors[0]?.error?.message, 'Edit category', TuiNotification.Error)
        }
      }
    }))
  }
}
