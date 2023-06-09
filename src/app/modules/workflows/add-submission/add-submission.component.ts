import { Component, Inject, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TuiDialogContext, TuiDialogService, TuiNotification } from '@taiga-ui/core';
import { BehaviorSubject, Subject, Subscription, pluck, switchMap, takeUntil } from 'rxjs';
import { NotificationsService } from 'src/core/core-services/notifications.service';
import { DashboardService } from '../../dashboard/dashboard.service';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkflowsService } from '../workflows.service';
import { AuthService } from '../../auth/auth.service';
import { PolymorpheusContent } from '@tinkoff/ng-polymorpheus';

@Component({
  templateUrl: './add-submission.component.html',
  styleUrls: ['./add-submission.component.scss']
})
export class AddSubmissionComponent implements OnDestroy {
  formTabs: any[] = [];
  activeIndex: number = 0;
  public formWithWorkflow: any;
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

  constructor(
    private fb: FormBuilder,
    private notif: NotificationsService,
    private dashBoardService: DashboardService,
    private activatedRoute: ActivatedRoute,
    private submissionService: WorkflowsService,
    private router: Router,
    private auth: AuthService,
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
    private dashboard: DashboardService
  ) {
    this.currentUser = this.auth.currentUserValue;
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

  populateData() {
    this.activatedRoute.params.pipe(
      pluck('id'),
      switchMap((submoduleID => this.dashBoardService.getSubModuleByID(submoduleID))),
      takeUntil(this.destroy$)
    ).subscribe((res: any) => {
      if(res) {
        this.subModuleData = res;
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
        })
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
            approverIds: data?.approverIds?.map(ids => ids.id),
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
      const formId = this.subModuleData?.formIds[this.activeIndex]?.id;
      this.formValues[this.activeIndex] = {...event, formId};
      const finalData = this.formValues?.map(value => {
        return {
          formId: value?.formId,
          data: value?.data
        }
      })
      this.formSubmission.next(finalData)
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
    if(this.dataSubmitValidation() == false) {
      return this.notif.displayNotification('Please provide valid condition for the workflow step/s', 'Create Submission', TuiNotification.Warning)
    }
    if(this.workflows.controls.map(val => val.get('approverIds')?.value.length > 1 && val.get('condition')?.value).includes('none')) {
      return this.notif.displayNotification('Please provide valid condition for the workflow step/s', 'Create Submission', TuiNotification.Warning)
    }
    if(this.formSubmission?.value?.length !== this.formWithWorkflow?.length) {
      return this.notif.displayNotification('Please provide data for all form fields', 'Create Submission', TuiNotification.Warning)
    }
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
        this.router.navigate(['/submodule/submissions/view-submissions', this.subModuleId])
      }
    })
  }

  countUsers(value: number, index: number) {
    if(value < 2) {
      this.workflows.at(index)?.get('condition')?.setValue('none')
      this.notif.displayNotification('Default condition of "None" will be used if the number of approvers is less than 2', 'Create Module', TuiNotification.Warning)
    }
    if(value >= 2 && this.workflows.at(index)?.get('condition')?.value == 'none') {
      this.notif.displayNotification('Please select either AND or OR as the condition', 'Create Module', TuiNotification.Warning)
    }
  }

  validateSelection(index: number) {
    if(this.workflows.at(index)?.get('approverIds')?.value?.length < 2) {
      this.workflows.at(index)?.get('condition')?.setValue('none')
      this.notif.displayNotification('Default condition of "None" will be used if the number of approvers is less than 2', 'Create Module', TuiNotification.Warning);
    }
    if(this.workflows.at(index)?.get('approverIds')?.value?.length >= 2 && this.workflows.at(index)?.get('condition')?.value == 'none') {
      this.notif.displayNotification('Please select either AND or OR as the condition', 'Create Module', TuiNotification.Warning)
    }
  }

  cancelSubmission() {
    this.router.navigate(['/submodule/submissions/view-submissions', this.subModuleId])
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
