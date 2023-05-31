import { Component, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormioOptions } from '@formio/angular';
import { TuiNotification } from '@taiga-ui/core';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/modules/auth/auth.service';
import { DashboardService } from 'src/app/modules/dashboard/dashboard.service';
import { FormsService } from 'src/app/modules/forms/services/forms.service';
import { DataTransportService } from 'src/core/core-services/data-transport.service';
import { NotificationsService } from 'src/core/core-services/notifications.service';

@Component({
  templateUrl: './edit-submodule.component.html',
  styleUrls: ['./edit-submodule.component.scss']
})
export class EditSubmoduleComponent {
  subModuleForm!: FormGroup;
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
  redirectToModuleID: string;
  companyList: any[];
  domainUrl = window.location.origin

  constructor(
    private fb: FormBuilder,
    public auth: AuthService,
    public transportService: DataTransportService,
    private router: Router,
    private dashboard: DashboardService,
    private activatedRoute: ActivatedRoute,
    private notif: NotificationsService,
    private formService: FormsService
  ) {
    this.initSubModuleForm();
    // get submodule for editing and initialize form
    this.getAllCompanies();
    this.getSubmoduleByIDForEdit();
    this.activatedRoute.queryParams.pipe(takeUntil(this.destroy$)).subscribe(val => {
      if(val['moduleID'] && val['moduleCode']) {
        this.transportService.moduleID.next(val['moduleID']);
        this.transportService.moduleCode.next(val['moduleCode']);
      }
    })
  }

  getSubmoduleByIDForEdit() {
    this.activatedRoute.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if(params['id']) {
        this.transportService.subModuleID.next(params['id']); // the id used to fetch the submodule data and to redirect from form builder
        this.dashboard.getSubModuleByID(params['id']).subscribe((response: any) => {
          if(response) {
            this.formComponents = response?.formIds;
            this.formTabs = response?.formIds?.map(forms => forms.title);
            const companyName = {
              value: response?.companyId?.id,
              label: response?.companyId?.title
            }
            const url = response?.url?.split('/').at(-1);
            const workFlowId = response?.workFlowId?.stepIds?.map(data => {
              return {
                id: data?.id,
                approverIds: data?.approverIds?.map(ids => ids.id),
                condition: data?.condition
              }
            });
            delete response?.workFlowId;
            delete response?.url;
            delete response?.companyId;
            const finalObject = Object.assign(response, {workFlowId: workFlowId}, {url: url}, {companyId: companyName})
            this.initSubModuleForm(finalObject)
          }
        })
      }
    });
  }

  getAllCompanies() {
    this.dashboard.getAllCompanies()
    .pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      this.companyList = res.results?.map(data => {
        return {
          value: data?.id,
          label: data?.title
        }
      });
    });
  }

  initSubModuleForm(item?: any) {
    this.subModuleForm = this.fb.group({
      subModuleUrl: [item?.url || null, Validators.required],
      code: [{value: item?.code || null, disabled: true}],
      companyName: [item?.companyId?.value || null, Validators.required],
      adminUsers: [item?.adminUsers || [], Validators.required],
      viewOnlyUsers: [item?.viewOnlyUsers || [], Validators.required],
      workflows: item?.workFlowId ?
      this.fb.array(
        item?.workFlowId?.map((val: { condition: any; approverIds: any; id: any }) => {
          return this.fb.group({
            id: val.id,
            condition: [val.condition, Validators.required],
            approverIds: [val.approverIds, Validators.required]
          })
        })
      )
      :
      this.fb.array([
        this.fb.group({
          condition: ['', Validators.required],
          approverIds: [[], Validators.required]
        })
      ])
    })
  }

  get f() {
    return this.subModuleForm.controls;
  }

  setAdminUsers(users: string[]) {
    this.subModuleForm?.get('adminUsers')?.setValue(users)
  }

  setViewUsers(users: string[]) {
    this.subModuleForm?.get('viewOnlyUsers')?.setValue(users)
  }

  sendFormForEdit(i: number, formID: string) {
    if(formID) {
      this.router.navigate(['/forms/edit-form'], {queryParams: {id: formID}});
    }
  else {
      this.transportService.isFormEdit.next(true);
      this.transportService.sendFormDataForEdit.next(this.formComponents[i]);
      this.router.navigate(['/forms/edit-form'], {queryParams: {submoduleID: this.transportService.subModuleID?.value}});
    }
  }

  deleteForm(id: string) {
    this.formService.deleteForm(id).pipe(takeUntil(this.destroy$))
    .subscribe(res => {
      this.getSubmoduleByIDForEdit();
    })
  }

  saveDraft() {
    this.transportService.sendFormBuilderData(this.formComponents)
    this.router.navigate(['/forms/edit-form']);
  }

  get workflows() {
    return this.f['workflows'] as FormArray
  }

  addWorkflowStep() {
    const workflowStepForm = this.fb.group({
      condition: ['', Validators.required],
      approverIds: [[], Validators.required]
    });
    this.workflows.push(workflowStepForm)
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
      return this.notif.displayNotification('Default condition of "None" will be used if the number of approvers is less than 2', 'Create Submodule', TuiNotification.Warning)
    }
    if(this.workflows.at(index)?.get('approverIds')?.value?.length >= 2 && this.workflows.at(index)?.get('condition')?.value == 'none') {
      return this.notif.displayNotification('Please select either AND or OR as the condition', 'Create Module', TuiNotification.Warning)
    }
  }

  countUsers(value: number, index: number) {
    if(value < 2) {
      this.workflows.at(index)?.get('condition')?.setValue('none')
      return this.notif.displayNotification('Default condition of "None" will be used if the number of approvers is less than 2', 'Create Module', TuiNotification.Warning)
    }
    if(value >= 2 && this.workflows.at(index)?.get('condition')?.value == 'none') {
      this.notif.displayNotification('Please select either AND or OR as the condition', 'Create Module', TuiNotification.Warning)
    }
  }

  dataSubmitValidation() {
    if(
      this.f['subModuleUrl']?.invalid ||
      this.f['companyName']?.invalid ||
      this.f['adminUsers']?.value?.length == 0 ||
      this.f['viewOnlyUsers']?.value?.length == 0 ||
      this.workflows?.length == 0 ||
      this.workflows.controls.map(val => val.get('approverIds')?.value.length == 0).includes(true) ||
      this.workflows.controls.map(val => val.get('condition')?.value).includes('') === true ||
      Object.values(this.formComponents)[0]?.components?.length == 0
    ) {
      return false
    }
    return true
  }

  saveSubModule(statusStr?: number) {
    if(this.dataSubmitValidation() == false) {
      this.subModuleForm.markAllAsTouched();
      return this.notif.displayNotification('Please provide all data', 'Edit Submodule', TuiNotification.Warning)
    }
    if(this.workflows.controls.map(val => val.get('approverIds')?.value.length > 1 && val.get('condition')?.value).includes('none')) {
      return this.notif.displayNotification('Please provide valid condition for the workflow step/s', 'Create Submodule', TuiNotification.Warning)
    }
    this.isCreatingSubModule.next(true)
    const payload = {
      url: `/submodule/submodule-details/${this.subModuleForm.get('subModuleUrl')?.value.replace(/\s/g, '-')}`,
      companyId: this.subModuleForm.get('companyName')?.value,
      code: this.subModuleForm.get('subModuleUrl')?.value.replace(/\s/g, '-'),
      adminUsers: this.subModuleForm.get('adminUsers')?.value?.map(data => data?.id),
      viewOnlyUsers: this.subModuleForm.get('viewOnlyUsers')?.value?.map(data => data?.id),
      // formIds: this.formComponents,
      steps: this.workflows?.value?.map(data => {
        return {
          id: data?.id ? data?.id : undefined,
          approverIds: data?.approverIds?.map(ids => ids.id ? ids.id : ids),
          condition: data?.condition
        }
      })
    }
    if(statusStr) {
      const status = statusStr;
      Object.assign(payload, {status})
    }
    console.log('FINAL PAYLOAD', payload);
    this.dashboard.updateSubModule(this.transportService.subModuleID?.value, payload)
    .pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if(res) {
        this.isCreatingSubModule.next(false);
        this.transportService.saveDraftLocally({});
        this.transportService.sendFormBuilderData([{title: '', key: '', display: '', components: []}]);
        this.router.navigate(['/submodule/submodules-list', this.transportService.moduleCode?.value], {queryParams: {moduleID: this.transportService.moduleID?.value}});
      }
      else {
        this.isCreatingSubModule.next(false);
      }
    })
  }
}
