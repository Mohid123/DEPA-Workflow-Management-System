import { Component, Inject, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TuiDialogContext, TuiDialogService, TuiNotification } from '@taiga-ui/core';
import { BehaviorSubject, Subject, Subscription, distinctUntilChanged, forkJoin, pluck, switchMap, takeUntil, tap, take, map } from 'rxjs';
import { NotificationsService } from 'src/core/core-services/notifications.service';
import { DashboardService } from '../../dashboard/dashboard.service';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkflowsService } from '../workflows.service';
import { AuthService } from '../../auth/auth.service';
import { PolymorpheusContent } from '@tinkoff/ng-polymorpheus';
import { StorageItem, getItem, getItemSession, setItem, setItemSession } from 'src/core/utils/local-storage.utils';
import { FormioUtils } from '@formio/angular';
import { DataTransportService } from 'src/core/core-services/data-transport.service';
import { BreakpointObserver, BreakpointState, Breakpoints } from '@angular/cdk/layout';
import { FormsService } from '../../forms/services/forms.service';

@Component({
  templateUrl: './add-submission.component.html',
  styleUrls: ['./add-submission.component.scss']
})
export class AddSubmissionComponent implements OnDestroy, OnInit {
  formTabs: any[] = [];
  activeIndex: number = 0;
  public formWithWorkflow: any = [];
  workflowForm: FormGroup;
  subModuleData: any;
  subModuleId: string;
  formDataIds: any[] = [];
  formSubmission = new BehaviorSubject<Array<any>>([]);
  destroy$ = new Subject();
  currentUser: any;
  createdByUser: any;
  activeItemIndex: number = 0;
  options: any = {
    "disableAlerts": true,
    "noDefaultSubmitButton": true
  }
  formValues: any[] = [];
  formValuesTemp: any[] = [];
  formEventVal: any;
  carouselIndex = 0;
  items: any[] = [];
  currentFieldArray: any;
  activeEmailIndex: number;
  userListForEmail: any[] = [];
  private readonly search$ = new Subject<string>();
  saveDialogSubscription: Subscription[] = [];
  limit: number = 10;
  page: number = 0;
  creatingSubmission = new Subject<boolean>();
  draftingSubmission = new Subject<boolean>();
  showError = new Subject<boolean>();
  errorIndex: number = 0;
  userRoleCheckAdmin: any;
  userRoleCheckUser: any;
  adminUsers: any[] = [];
  currentBreakpoint: string = '';
  hooks: any;
  BreakPoints = Breakpoints
  @ViewChildren('formioForm') formioForms: QueryList<any>;
  readonly breakpoint$ = this.breakpointObserver
  .observe([Breakpoints.Large, Breakpoints.Medium, Breakpoints.Small, '(min-width: 500px)'])
  .pipe(
    distinctUntilChanged()
  );
  rxJsOperators = {
    takeUntil,
    forkJoin,
    take,
    map,
    tap,
    switchMap
  };
  onLoadFn: Function;
  onChangeFn: Function;
  globalVar: any;

  constructor(
    private fb: FormBuilder,
    private notif: NotificationsService,
    private dashBoardService: DashboardService,
    private activatedRoute: ActivatedRoute,
    private submissionService: WorkflowsService,
    private router: Router,
    private auth: AuthService,
    private transportService: DataTransportService,
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
    private dashboard: DashboardService,
    private breakpointObserver: BreakpointObserver,
    private formService: FormsService
  ) {
    this.currentUser = this.auth.currentUserValue;
    this.userRoleCheckAdmin = this.auth.checkIfRolesExist('sysAdmin')
    this.userRoleCheckUser = this.auth.checkIfRolesExist('user')
    this.initWorkflowForm();
    this.activatedRoute.params.pipe(takeUntil(this.destroy$)).subscribe(val => this.subModuleId = val['id']);
    this.populateData();

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
    const hierarchy = getItemSession(StorageItem.navHierarchy);
    hierarchy.forEach(val => {
      val.routerLink = `/modules/${val.code}?moduleID=${getItemSession(StorageItem.moduleID)}`
    })
    this.dashboard.items = [...hierarchy, {
      caption: 'Add Submission',
      routerLink: `/modules/${getItemSession(StorageItem.moduleSlug)}/add-submission/${getItemSession(StorageItem.moduleID)}`
    }];
    this.breakpoint$.subscribe(() =>
      this.breakpointChanged()
    );
  }
  
  private breakpointChanged() {
    if(this.breakpointObserver.isMatched(Breakpoints.Large)) {
      this.currentBreakpoint = Breakpoints.Large;
    } else if(this.breakpointObserver.isMatched(Breakpoints.Medium)) {
      this.currentBreakpoint = Breakpoints.Medium;
    } else if(this.breakpointObserver.isMatched(Breakpoints.Small)) {
      this.currentBreakpoint = Breakpoints.Small;
    } else if(this.breakpointObserver.isMatched('(min-width: 500px)')) {
      this.currentBreakpoint = '(min-width: 500px)';
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

  populateData() {
    this.activatedRoute.params.pipe(
      pluck('id'),
      switchMap((submoduleID => this.dashBoardService.getSubModuleByID(submoduleID, true))),
      takeUntil(this.destroy$)
    ).subscribe((res: any) => {
      if(res) {
        this.hooks = res?.triggers || [];
        res?.formIds?.forEach((comp, index) => {
          if(comp?.defaultData) {
            this.formValuesTemp[index] = {data: comp?.defaultData?.data, formId: comp?.id}
          }
          FormioUtils.eachComponent(comp?.components, (component) => {
            if(component?.type == 'editgrid') {
              for (const key in component.templates) {
                component.templates[key] = component.templates[key]?.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
              }
            }
            if(component?.type == 'select') {
              component.template = component.template?.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
            }
            if(component?.html) {
              component.html = component.html?.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
            }
            if(component?.wysiwyg && component?.wysiwyg == true) {
              comp.sanitize = true
            }
            if(component?.permissions && component?.permissions?.length > 0) {
              return component?.permissions?.map(permit => {
                if(this.currentUser?.id == permit?.id) {
                  if(permit.canEdit == true) {
                    component.disabled = false
                  }
                  else {
                    component.disabled = true
                  }
                  if(permit.canView == false) {
                    component.hidden = true
                  }
                  else {
                    component.hidden = false
                  }
                }
              })
            }
          }, true)
        });
        this.subModuleData = res;
        if(this.subModuleData?.events && this.subModuleData?.events?.length > 0) {
          this.subModuleData?.events?.forEach(val => {
            if(val?.name == 'onLoad') {
              val.code = val?.code?.replace(/&lt;/g, "<")?.replace(/&gt;/g, ">");
              this.onLoadFn = new Function('return ' + val.code)();
            }
            if(val?.name == 'onChange') {
              val.code = val?.code?.replace(/&lt;/g, "<")?.replace(/&gt;/g, ">");
              this.onChangeFn = new Function('return ' + val.code)();
            }
          })
        }
        this.adminUsers = res?.adminUsers?.map(val => val?.id);
        this.formWithWorkflow = res?.formIds?.map(comp => {
          return {
            ...comp,
            components: comp.components?.map(data => {
              if(data?.label && data?.label == 'Submit') {
                data.hidden = true;
                return data
              }
              return data
            })
          }
        });
        this.formTabs = res?.formIds?.map(forms => forms.title);
        this.items = res?.workFlowId?.stepIds?.map(data => {
          return {
            approvers: data?.approverIds?.map(appr => appr?.fullName),
            condition: data?.condition,
            emailNotifyTo: data?.emailNotifyToId?.notifyUsers || []
          }
        });
        this.createdByUser = res?.createdBy;
        const workFlowId = res?.workFlowId?.stepIds?.map(data => {
          return {
            approverIds: data?.approverIds?.map(ids => {
              return {
                name: ids?.fullName,
                id: ids?.id,
                control: new FormControl<boolean>(true)
              }
            }),
            condition: data?.condition,
            emailNotifyTo: data?.emailNotifyToId?.notifyUsers || []
          }
        });
        delete this.subModuleData?.workFlowId;
        Object.assign(this.subModuleData, {workFlowId: workFlowId})
        this.initWorkflowForm(workFlowId);
      }
    })
  }

  sanitizeSubmission(value: any) {
    let data = value?.data;
    if(data) {
      for (const key in data) {
        if(typeof(data[key]) == 'string') {
          data[key] = data[key]?.replace(/&lt;/g, "<")?.replace(/&gt;/g, ">");
        }
        if(key == 'dataGrid') {
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

  disableModify() {
    if(this.subModuleData?.accessType && this.subModuleData?.accessType == 'anyCreateAndModify') {
      return false
    }
    if(this.userRoleCheckAdmin == true) {
      return false
    }
    if(this.adminUsers?.includes(this.currentUser?.id)) {
      return false
    }
    return true
  }

  initWorkflowForm(item?: any) {
    if(item) {
      this.workflowForm = this.fb.group({
        workflows: this.fb.array(
          item?.map((val: { condition: any; approverIds: any; emailNotifyTo: any; emailNotifyToId?: any; id?: any }) => {
            return this.fb.group({
              condition: [val.condition, Validators.required],
              approverIds: [val.approverIds, Validators.required],
              emailNotifyTo: [val?.emailNotifyTo || [], Validators.required]
            })
          }))
        })
    }
    else {
      this.workflowForm = this.fb.group({
        workflows: this.fb.array([
          this.fb.group({
            condition: ['', Validators.required],
            approverIds: [[], Validators.required],
            emailNotifyTo: [[], Validators.required]
          })
        ])
      })
    }
  }

  get workflows() {
    return this.workflowForm.controls['workflows'] as FormArray
  }

  addWorkflowStep() {
    const workflowStepForm = this.fb.group({
      approverIds: [[], Validators.required],
      condition: [{value: '', disabled: ''}, Validators.required],
      emailNotifyTo: [[], Validators.required]
    });
    this.workflows.push(workflowStepForm);
  }

  removeWorkflowStep(index: number) {
    this.workflows.removeAt(index);
  }

  getApproverList(value: string[], index: number) {
    this.workflows.at(index)?.get('approverIds')?.setValue(value);
  }

  onChange(event: any, index: number) {
    if(event?.changed && event?.changed?.component?.type == 'file') {
      let key = event?.changed?.component?.key
      event?.data[key]?.forEach(value => {
        value.url = value?.data?.baseUrl.split('v1')[0] + value?.data?.fileUrl
      })
    }
    if(event?.data && event?.changed && event.isModified == true) {
      const formId = this.subModuleData?.formIds[index]?.id;
      this.formValuesTemp[index] = {...event, formId};
    }
  }

  dataSubmitValidation() {
    if(
      this.workflows?.length == 0 ||
      this.workflows.controls.map(val => val.get('approverIds')?.value.length == 0).includes(true) ||
      this.workflows.controls.map(val => val.get('condition')?.value).includes('') === true
    ) {
      return false
    }
    return true
  }

  createSubmission(status?: any) {
    let formComps = JSON.parse(JSON.stringify(this.formWithWorkflow))
    let formioInstance: any[] = [];
    formComps?.forEach((form, index) => {
      this.formioForms.toArray()[index].formio?.components?.forEach((comp, i) => {
        if(comp?._disabled === true) {
          this.formioForms.toArray()[index].formio?.components?.splice(i, 1)
        }
      });
    });
    formComps?.forEach((form, index) => {
      this.formioForms.toArray()[index].formio?.components?.forEach((comp, i) => {
        let instance = this.formioForms.toArray()[index].formio.checkValidity(comp.key, true, null, false);
        formioInstance.push(instance);
      });
    });
    if(formioInstance.includes(false)) {
      return this.notif.displayNotification('Please provide valid data for all required fields', 'Form Validation', TuiNotification.Warning)
    }
    if(this.dataSubmitValidation() == false) {
      return this.notif.displayNotification('Please provide valid condition for the workflow step/s', 'Create Submission', TuiNotification.Warning)
    }
    if(this.workflows.controls.map(val => val.get('approverIds')?.value.length > 1 && val.get('condition')?.value).includes('none')) {
      return this.notif.displayNotification('Please provide valid condition for the workflow step/s', 'Create Submission', TuiNotification.Warning)
    }
    if(!status) {
      this.creatingSubmission.next(true);
      if(this.hooks?.length > 0) {
        this.formValuesTemp?.forEach(submission => {
          this.hooks.forEach(val => {
            if(val?.name == 'beforeSubmit') {
              val.code = val?.code?.replace(/&lt;/g, "<")?.replace(/&gt;/g, ">");
              val.code = new Function('return ' + val.code)();
              val.code(submission?.data, this.formService, this.submissionService, this.dashBoardService, this.rxJsOperators, this.destroy$, 0, 1);
            }
          })
        })
      }
    }
    else {
      this.draftingSubmission.next(true)
    }
    let finalData = [];
    this.formValues = this.formValuesTemp;
    this.formWithWorkflow.forEach((form: any) => {
      finalData.push({
        formId: form.id,
        data: {}
      });
    });
    this.formValues.forEach((value, i) => {
      if (value) {
        finalData[i] = {
          formId: value?.formId,
          data: value?.data
        };
      }
    });
    this.formSubmission.next(finalData)
    const payload: any = {
      subModuleId: this.subModuleId,
      formIds: this.subModuleData?.formIds?.map(val => val.id),
      formDataIds: this.formSubmission?.value,
      submissionStatus: status ? status : undefined,
      steps: this.workflows?.value?.map(data => {
        return {
          approverIds: data?.approverIds?.map(ids => ids.id ? ids.id : ids),
          condition: data?.condition,
          emailNotifyTo: data?.emailNotifyTo || []
        }
      })
    }
    debugger
    this.submissionService.addNewSubmission(payload).pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if(res) {
        if(!status) {
          if(this.hooks?.length > 0) {
            this.formValuesTemp?.forEach(submission => {
              this.hooks.forEach(val => {
                if(val?.name == 'afterSubmit') {
                  val.code = val?.code?.replace(/&lt;/g, "<")?.replace(/&gt;/g, ">");
                  val.code = new Function('return ' + val.code)();
                  val.code(submission?.data, this.formService, this.submissionService, this.dashBoardService, this.rxJsOperators, this.destroy$, res?.summaryData?.progress, res?.submissionStatus);
                }
              })
            })
          }
        }
        this.creatingSubmission.next(false);
        this.draftingSubmission.next(false)
        this.router.navigate(['/modules', getItemSession(StorageItem.moduleSlug) || ''], {queryParams: {moduleID: getItemSession(StorageItem.moduleID) || ''}});
      }
      else {
        this.creatingSubmission.next(false);
        this.draftingSubmission.next(false);
      }
    })
  }

  countUsers(value: number, index: number) {
    this.errorIndex = index
    if(value < 2) {
      this.workflows.at(index)?.get('condition')?.setValue('none')
      this.notif.displayNotification('Default condition of "None" will be used if the number of approvers is less than 2', 'Create Module', TuiNotification.Info)
      return this.showError.next(false)
    }
    if(value >= 2 && this.workflows.at(index)?.get('condition')?.value == 'none') {
      return this.showError.next(true)
    }
    this.showError.next(false)
  }

  validateSelection(index: number) {
    this.errorIndex = index
    if(this.workflows.at(index)?.get('approverIds')?.value?.length < 2) {
      this.workflows.at(index)?.get('condition')?.setValue('none')
      this.notif.displayNotification('Default condition of "None" will be used if the number of approvers is less than 2', 'Create Module', TuiNotification.Info);
      return this.showError.next(false)
    }
    if(this.workflows.at(index)?.get('approverIds')?.value?.length >= 2 && this.workflows.at(index)?.get('condition')?.value == 'none') {
      return this.showError.next(true)
    }
    this.showError.next(false)
  }

  cancelSubmission() {
    this.router.navigate(['/modules', getItemSession(StorageItem.moduleSlug) || ''], {queryParams: {moduleID: getItemSession(StorageItem.moduleID) || ''}});
  }

  sendFormForEdit(i: number, formID: string, key: string) {
    if(formID) {
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
      setItemSession(StorageItem.formKey, key)
      this.transportService.editBreadcrumbs.next(this.dashboard.items)
      setItemSession(StorageItem.editBreadcrumbs, this.dashboard.items)
      this.router.navigate(['/forms/edit-form'], {queryParams: {id: formID, fromSubmission: true}});
    }
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
