import { Component, Inject, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TuiDialogContext, TuiDialogService, TuiNotification } from '@taiga-ui/core';
import { BehaviorSubject, Subject, Subscription, pluck, switchMap, takeUntil } from 'rxjs';
import { NotificationsService } from 'src/core/core-services/notifications.service';
import { DashboardService } from '../../dashboard/dashboard.service';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkflowsService } from '../workflows.service';
import { AuthService } from '../../auth/auth.service';
import { PolymorpheusContent } from '@tinkoff/ng-polymorpheus';
import { StorageItem, getItem, setItem } from 'src/core/utils/local-storage.utils';
import { FormioUtils } from '@formio/angular';
import { DataTransportService } from 'src/core/core-services/data-transport.service';

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
  @ViewChildren('formioForm') formioForms: QueryList<any>;

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
    private dashboard: DashboardService
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
    const hierarchy = getItem(StorageItem.navHierarchy);
    hierarchy.forEach(val => {
      val.routerLink = `/modules/${val.code}?moduleID=${getItem(StorageItem.moduleID)}`
    })

    this.dashboard.items = [...hierarchy, {
      caption: 'Add Submission',
      routerLink: `/modules/${getItem(StorageItem.moduleSlug)}/add-submission/${getItem(StorageItem.moduleID)}`
    }];
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

  // comp.components?.map(data => {
  //   if(data?.permissions?.length > 0) {
  //     data?.permissions?.map(permit => {
  //       if(this.currentUser?.id == permit?.id) {
  //         if(permit.canEdit == true) {
  //           data.disabled = false
  //         }
  //         else {
  //           data.disabled = true
  //         }
  //         if(permit.canView == false) {
  //           data.hidden = true
  //         }
  //         else {
  //           data.hidden = false
  //         }
  //       }
  //     })
  //   }
  // })

  populateData() {
    this.activatedRoute.params.pipe(
      pluck('id'),
      switchMap((submoduleID => this.dashBoardService.getSubModuleByID(submoduleID))),
      takeUntil(this.destroy$)
    ).subscribe((res: any) => {
      if(res) {
        this.subModuleData = res;
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
        FormioUtils.eachComponent(this.formWithWorkflow, (comp) => {
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
    if(event?.data && event?.changed) {
      if(event?.data?.file) {
        event?.data?.file?.forEach(value => {
          value.url = value?.data?.baseUrl.split('v1')[0] + value?.data?.fileUrl
        })
      }
      const formId = this.subModuleData?.formIds[index]?.id;
      this.formValues[index] = {...event, formId};
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
      this.creatingSubmission.next(true)
    }
    else {
      this.draftingSubmission.next(true)
    }
    let finalData = [];
    this.formWithWorkflow.forEach((form: any, i: number) => {
      if(this.formValues[i]) {
        finalData = this.formValues?.map(value => {
          return {
            formId: value?.formId,
            data: value?.data
          }
        })
      }
      else {
        finalData = [...finalData, {
          formId: form.id,
          data: {}
        }]
      }
      this.formSubmission.next(finalData)
    })
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
    this.submissionService.addNewSubmission(payload).pipe(takeUntil(this.destroy$))
    .subscribe(res => {
      if(res) {
        this.creatingSubmission.next(false);
        this.draftingSubmission.next(false)
        this.router.navigate(['/modules', getItem(StorageItem.moduleSlug) || ''], {queryParams: {moduleID: getItem(StorageItem.moduleID) || ''}});
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
    this.router.navigate(['/modules', getItem(StorageItem.moduleSlug) || ''], {queryParams: {moduleID: getItem(StorageItem.moduleID) || ''}});
  }

  sendFormForEdit(i: number, formID: string) {
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
      setItem(StorageItem.approvers, approvers)
      this.transportService.editBreadcrumbs.next(this.dashboard.items)
      this.router.navigate(['/forms/edit-form'], {queryParams: {id: formID}});
    }
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
