import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TuiNotification } from '@taiga-ui/core';
import { Observable, map, pluck, switchMap } from 'rxjs';
import { NotificationsService } from 'src/core/core-services/notifications.service';
import { DashboardService } from '../../dashboard/dashboard.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './add-submission.component.html',
  styleUrls: ['./add-submission.component.scss']
})
export class AddSubmissionComponent {
  formTabs: any[] = [];
  activeIndex: number = 0;
  public formWithWorkflow: any;
  workflowForm: FormGroup;
  subModuleData: any;

  constructor(
    private fb: FormBuilder,
    private notif: NotificationsService,
    private dashBoardService: DashboardService,
    private activatedRoute: ActivatedRoute
  ) {
    this.initWorkflowForm()
    this.activatedRoute.params.pipe(
      pluck('id'),
      switchMap((submoduleID => this.dashBoardService.getSubModuleByID(submoduleID)))
    ).subscribe(res => {
      if(res) {
        this.subModuleData = res;
        console.log(this.subModuleData)
        // this.initWorkflowForm()
      }
    })
  }

  initWorkflowForm(item?: any) {
    if(item?.steps) {
      this.workflowForm = this.fb.group({
        workflows: this.fb.array(
          item?.steps?.map((val: { condition: any; approverIds: any; id?: any }) => {
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

  validateSelection(index: number) {
    if(this.workflows.at(index)?.get('approverIds')?.value?.length < 2) {
      this.workflows.at(index)?.get('condition')?.setValue('none')
      return this.notif.displayNotification('Default condition of "None" will be used if the number of approvers is less than 2', 'Create Module', TuiNotification.Warning)
    }
  }
}
