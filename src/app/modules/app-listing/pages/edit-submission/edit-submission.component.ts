import { Component, Inject, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TuiDialogContext, TuiDialogService, TuiNotification } from '@taiga-ui/core';
import { BehaviorSubject, Subject, Subscription, switchMap, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/modules/auth/auth.service';
import { DashboardService } from 'src/app/modules/dashboard/dashboard.service';
import { StorageItem, getItem, setItem } from 'src/core/utils/local-storage.utils';
import { PolymorpheusContent } from '@tinkoff/ng-polymorpheus';
import { NotificationsService } from 'src/core/core-services/notifications.service';
import { WorkflowsService } from 'src/app/modules/workflows/workflows.service';
import { Location } from '@angular/common';
import { FormioUtils } from '@formio/angular';
import { DataTransportService } from 'src/core/core-services/data-transport.service';

@Component({
  templateUrl: './edit-submission.component.html',
  styleUrls: ['./edit-submission.component.scss']
})
export class EditSubmissionComponent implements OnInit, OnDestroy {
  formTabs: any[] = [];
  activeIndex: number = 0;
  currentUser: any;
  forms: any;
  options: any = {
    "disableAlerts": true,
    "noDefaultSubmitButton": true
  }
  items: any[] = [];
  activeItemIndex: number = 0;
  workflowForm: FormGroup;
  limit: number = 10;
  page: number = 0;
  destroy$ = new Subject();
  private readonly search$ = new Subject<string>();
  userListForEmail: any[] = [];
  currentFieldArray: any;
  activeEmailIndex: number;
  saveDialogSubscription: Subscription[] = [];
  creatingSubmission = new Subject<boolean>();
  carouselIndex = 0;
  errorIndex: number = 0;
  showError = new Subject<boolean>();
  formSubmission = new BehaviorSubject<Array<any>>([]);
  subModuleId: string;
  subModuleData: any;
  formValues: any[] = [];
  workFlowId: string;
  userRoleCheck: any;
  approvalLogs = [];
  @ViewChildren('formioForm') formioForms: QueryList<any>;

  constructor(
    private auth: AuthService,
    private notif: NotificationsService,
    private router: Router,
    private fb: FormBuilder,
    private dashboard: DashboardService,
    private workflowService: WorkflowsService,
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private transportService: DataTransportService
  ) {
    this.currentUser = this.auth.currentUserValue;
    this.userRoleCheck = this.auth.checkIfRolesExist('sysAdmin')
    this.initWorkflowForm();
    this.activatedRoute.params.pipe(takeUntil(this.destroy$)).subscribe(val => {
      this.subModuleId = val['id'];
      this.fetchAndPopulateData(this.subModuleId)
    });

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
    const hierarchy = getItem(StorageItem.navHierarchy);
    hierarchy.forEach(val => {
      val.routerLink = `/modules/${val.code}?moduleID=${getItem(StorageItem.moduleID)}`
    })
    this.dashboard.items = [...hierarchy, {
      caption: getItem(StorageItem.formKey) || 'Edit Submission',
      routerLink: `/modules/edit-submission/${getItem(StorageItem.editSubmissionId)}`
    }];
  }

  fetchAndPopulateData(id: string) {
    this.workflowService.getWorkflowSubmission(id).pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if(res) {
        this.subModuleData = res;
        this.workFlowId = res?.workFlowId?._id;
        this.approvalLogs = res?.approvalLog;
        this.forms = res?.formIds?.map(comp => {
          FormioUtils.eachComponent(comp?.components, (component) => {
            if(component?.type == 'select') {
              component.template = component.template?.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
            }
            if(component?.wysiwyg && component?.wysiwyg == true) {
              comp.sanitize = true
            }
          }, true)
          return {
            ...comp,
            components: comp?.components?.map(data => {
              if(data?.label && data?.label == 'Submit') {
                data.hidden = true;
                return data
              }
              return data
            }),
            formDataId: res?.formDataIds?.map(val => {
              if(val.formId == comp?._id) {
                return val?._id
              }
            }).filter(val => val)[0],
            data: res?.formDataIds?.map(val => {
              if(val.formId == comp?._id) {
                return val?.data
              }
            }).filter(val => val)[0]
          }
        });
        FormioUtils.eachComponent(this.forms, (comp) => {
          if(comp?.permissions && comp?.permissions?.length > 0) {
            return comp?.permissions?.map(permit => {
              if(this.currentUser?.id == permit?.id) {
                if(permit.canEdit == true) {
                  comp.disabled = false
                }
                else {
                  comp.disabled = true
                }
                if(permit.canView == false) {
                  comp.hidden = true
                }
                else {
                  comp.hidden = false
                }
              }
            })
          }
        }, true);
        this.formTabs = res?.formIds?.map(forms => forms.title);
        this.items = res?.workFlowId?.stepIds?.map(data => {
          return {
            approvers: data?.approverIds?.map(appr => appr?.fullName),
            condition: data?.condition,
            emailNotifyTo: data?.emailNotifyToId?.notifyUsers || []
          }
        });
        const workFlowId = res?.workFlowId?.stepIds?.map(data => {
          return {
            id: data?.id,
            approverIds: data?.approverIds?.map(ids => {
              return {
                name: ids?.fullName,
                id: ids?._id,
                control: new FormControl<boolean>(true)
              }
            }),
            condition: data?.condition,
            emailNotifyTo: data?.emailNotifyToId?.notifyUsers || [],
            emailNotifyToId: data?.emailNotifyToId?.id
          }
        });
        delete this.subModuleData?.workFlowId;
        Object.assign(this.subModuleData, {workFlowId: workFlowId})
        this.initWorkflowForm(workFlowId);
      }
    })
  }

  checkApprovalLogs() {
    return (
      this.approvalLogs?.map(value => value?.approvalStatus)?.includes('approved') ||
      this.approvalLogs?.map(value => value?.approvalStatus)?.includes('created')
    )
  }

  initWorkflowForm(item?: any) {
    if(item) {
      this.workflowForm = this.fb.group({
        workflows: this.fb.array(
          item?.map((val: { condition: any; approverIds: any; emailNotifyTo: any; emailNotifyToId?: any; id?: any }) => {
            return this.fb.group({
              id: val.id,
              condition: [val.condition, Validators.required],
              approverIds: [val.approverIds, Validators.required],
              emailNotifyTo: [val.emailNotifyTo || [], Validators.required],
              emailNotifyToId: val?.emailNotifyToId,
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
      this.transportService.editBreadcrumbs.next(this.dashboard.items)
      setItem(StorageItem.editBreadcrumbs, this.dashboard.items)
      setItem(StorageItem.formKey, key)
      setItem(StorageItem.approvers, approvers)
      this.router.navigate(['/forms/edit-form'], {queryParams: {id: formID}});
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
    this.router.navigate(['/modules', getItem(StorageItem.moduleSlug) || ''], {queryParams: {moduleID: getItem(StorageItem.moduleID) || ''}});
  }

  onChange(event: any, index: number) {
    if(event?.data && event?.changed) {
      if(event?.changed && event?.changed?.component?.type == 'file') {
        let key = event?.changed?.component?.key
        event?.data[key]?.forEach(value => {
          value.url = value?.data?.baseUrl.split('v1')[0] + value?.data?.fileUrl
        })
        // console.log(event)
        // if(event?.data?.type == 'datagrid') {
          // event?.data?.dataGrid?.forEach(comp => {
          //   if(comp?.file) {
          //     comp.file?.forEach(value => {
          //       value.url = value?.data?.baseUrl.split('v1')[0] + value?.data?.fileUrl
          //     })
          //   }
          // })
        // }
      }
      const formId = this.subModuleData?.formDataIds[index]?._id;
      const id = this.subModuleData?.formDataIds[index]?.formId;
      this.formValues[index] = {...event, formId, id};
    }
  }

  editSubmission(status?: number) {
    let formComps = JSON.parse(JSON.stringify(this.forms))
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
    this.creatingSubmission.next(true);
    let finalData = [];
    formComps?.forEach((form: any, i: number) => {
      if(this.formValues[i]) {
        finalData = this.formValues?.map(value => {
          return {
            formId: value?._id || value?.id,
            data: value?.data || value?.defaultData?.data || {},
            id: value?.formDataId || value?.formId
          }
        })
      }
      else {
        finalData = [...finalData, {
          formId: form._id,
          id: form?.formDataId,
          data: form?.defaultData?.data || {}
        }]
      }
      this.formSubmission.next(finalData)
    })
    const payload: any = {
      workFlowId: this.workFlowId,
      formDataIds: this.formSubmission?.value,
      submissionStatus: status ? status : 1,
      type: 'edit',
      steps: this.workflows?.value?.map(data => {
        return {
          id: data?.id ? data?.id : undefined,
          approverIds: data?.approverIds?.map(ids => ids.id ? ids.id : ids),
          condition: data?.condition,
          emailNotifyTo: data?.emailNotifyTo || [],
          emailNotifyToId: data?.emailNotifyToId ? data?.emailNotifyToId : undefined,
        }
      })
    }
    this.workflowService.updateSubmissionWorkflow(this.subModuleId, payload).pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if(res) {
        this.creatingSubmission.next(true);
        this.location.back()
      }
    })
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
