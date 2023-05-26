import { Component, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TuiNotification } from '@taiga-ui/core';
import { BehaviorSubject, Subject, pluck, switchMap, takeUntil } from 'rxjs';
import { NotificationsService } from 'src/core/core-services/notifications.service';
import { DashboardService } from '../../dashboard/dashboard.service';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkflowsService } from '../workflows.service';
import { AuthService } from '../../auth/auth.service';
import { Location } from '@angular/common';

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
  formDataIds: any;
  formSubmission = new BehaviorSubject<Array<any>>([]);
  destroy$ = new Subject();
  currentUser: any;
  createdByUser: any;

  constructor(
    private fb: FormBuilder,
    private notif: NotificationsService,
    private dashBoardService: DashboardService,
    private activatedRoute: ActivatedRoute,
    private submissionService: WorkflowsService,
    private router: Router,
    private auth: AuthService,
    public _location: Location
  ) {
    this.currentUser = this.auth.currentUserValue;
    this.initWorkflowForm();
    this.activatedRoute.params.pipe(takeUntil(this.destroy$)).subscribe(val => this.subModuleId = val['id']);
    this.populateData();

  }

  populateData() {
    this.activatedRoute.params.pipe(
      pluck('id'),
      switchMap((submoduleID => this.dashBoardService.getSubModuleByID(submoduleID))),
      takeUntil(this.destroy$)
    ).subscribe((res: any) => {
      if(res) {
        this.subModuleData = res;
        this.formWithWorkflow = res?.formIds;
        this.formTabs = res?.formIds?.map(forms => forms.title);
        this.createdByUser = res?.createdBy;
        const workFlowId = res?.workFlowId?.stepIds?.map(data => {
          return {
            approverIds: data?.approverIds?.map(ids => ids.id),
            condition: data?.condition
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
          item?.map((val: { condition: any; approverIds: any; id?: any }) => {
            return this.fb.group({
              condition: [val.condition, Validators.required],
              approverIds: [val.approverIds, Validators.required],
              id: [val.id || undefined]
            })
          }))
        })
    }
    else {
      this.workflowForm = this.fb.group({
        workflows: this.fb.array([
          this.fb.group({
            condition: ['', Validators.required],
            approverIds: [[], Validators.required]
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
    this.formDataIds = this.subModuleData?.formIds?.map((val: any, i: number) => {
      if(index === i) {
        return {
          formId: val.id,
          data: event?.data
        }
      }
      return {
        formId: val.id,
        data: null
      }
    }).filter(value => value?.data !== null);
    if(this.formSubmission?.value?.length > 0) {
      this.formSubmission.next([...this.formSubmission?.value, ...this.formDataIds])
    }
    else {
      this.formSubmission.next(this.formDataIds)
    }
    console.log(this.formSubmission?.value)
  }

  createSubmission(data: any) {
    const payload: any = {
      subModuleId: this.subModuleId,
      formIds: this.subModuleData?.formIds?.map(val => val.id),
      formDataIds: this.formSubmission?.value,
      steps: this.workflows?.value?.map(data => {
        return {
          approverIds: data?.approverIds?.map(ids => ids.id ? ids.id : ids),
          condition: data?.condition
        }
      })
    }
    this.submissionService.addNewSubmission(payload).pipe(takeUntil(this.destroy$))
    .subscribe(res => {
      if(res) {
        this.router.navigate(['/workflows/view-submissions', this.subModuleId])
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

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
