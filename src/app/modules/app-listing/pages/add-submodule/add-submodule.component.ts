import { Component, EventEmitter, HostListener, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormioOptions } from '@formio/angular';
import { TuiNotification } from '@taiga-ui/core';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/modules/auth/auth.service';
import { DashboardService } from 'src/app/modules/dashboard/dashboard.service';
import { DataTransportService } from 'src/core/core-services/data-transport.service';
import { NotificationsService } from 'src/core/core-services/notifications.service';

@Component({
  templateUrl: './add-submodule.component.html',
  styleUrls: ['./add-submodule.component.scss']
})
export class AddSubmoduleComponent implements OnDestroy {
  subModuleForm!: FormGroup;
  submoduleFromLS: any;
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
  domainURL = window.location.origin

  constructor(
    private fb: FormBuilder,
    public auth: AuthService,
    public transportService: DataTransportService,
    private router: Router,
    private dashboard: DashboardService,
    private activatedRoute: ActivatedRoute,
    private notif: NotificationsService
  ) {
    this.initSubModuleForm();
    this.submoduleFromLS = this.transportService.subModuleDraft.value;

    //get default workflow
    this.getDefaultWorkflow();

    this.formComponents = this.transportService.formBuilderData.value;
    this.formTabs = this.formComponents.map(val => val.title);

    this.getAllCompanies();
  }

  getDefaultWorkflow() {
    this.activatedRoute.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if(params['moduleID']) {
        this.redirectToModuleID = params['moduleID'];
        this.transportService.moduleID.next(params['moduleID']);
        this.dashboard.getWorkflowFromModule(params['moduleID']).subscribe((response: any) => {
          if(response) {
            this.initSubModuleForm(response)
          }
          if(Object.keys(this.submoduleFromLS)?.length > 0) {
            this.initSubModuleForm(this.submoduleFromLS);
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
      subModuleUrl: [item?.subModuleUrl || null, Validators.compose([Validators.required])],
      companies: this.fb.array([]),
      code: [{value: item?.code, disabled: true} || {value: null, disabled: true}],
      companyName: [item?.companyName || null, Validators.required],
      adminUsers: [item?.adminUsers || [], Validators.required],
      viewOnlyUsers: [item?.viewOnlyUsers || [], Validators.required],
      workflows: this.fb.array(
        item?.workflows ?
        item?.workflows?.map((val: { condition: any; approverIds: any; }) => {
          return this.fb.group({
            condition: [val.condition, Validators.required],
            approverIds: [val.approverIds, Validators.required]
          })
        }) :
        item?.map((val: { condition: any; approverIds: any; }) => {
          return this.fb.group({
            condition: [val.condition, Validators.required],
            approverIds: [val.approverIds, Validators.required]
          })
        })
        ||
        [
          this.fb.group({
            condition: [null, Validators.required],
            approverIds: [[], Validators.required]
          })
        ]
      )
    })
  }

  get f() {
    return this.subModuleForm.controls
  }

  get companies() {
    return this.f["companies"] as FormArray;
  }

  addCompany() {
    const companyForm = this.fb.group({
      title: ['', Validators.required]
    });
    this.companies.push(companyForm)
  }

  removeCompany(index: number) {
    this.companies.removeAt(index);
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

  submitNewCompany() {
    const payload: any = {
      title: this.f["companies"]?.value[0]?.title,
      groupCode: this.f["companies"]?.value[0]?.title.replace(/\s/g, '-')
    }
    this.dashboard.addCompany(payload).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if(res) {
        this.companies.reset();
        this.companies.removeAt(0);
        this.getAllCompanies();
      }
    })
  }

  saveDraft() {
    this.transportService.isFormEdit.next(false);
    this.transportService.saveDraftLocally(this.subModuleForm.value);
    this.router.navigate(['/forms/form-builder']);
  }

  sendFormForEdit(index: number) {
    this.transportService.isFormEdit.next(true);
    this.transportService.sendFormDataForEdit.next(this.formComponents[index]);
    this.transportService.saveDraftLocally(this.subModuleForm.value);
    this.router.navigate(['/forms/form-builder']);
  }

  changeLanguage(lang: string) {
    this.language.emit(lang);
  }

  saveSubModule(statusStr?: number) {
    if(this.dataSubmitValidation() == false) {
      this.subModuleForm.markAllAsTouched();
      return this.notif.displayNotification('Please provide all data', 'Create Submodule', TuiNotification.Warning)
    }
    this.isCreatingSubModule.next(true)
    const payload = {
      url: `/appListing/submodule-details/${this.subModuleForm.get('subModuleUrl')?.value.replace(/\s/g, '-')}`,
      moduleId: this.transportService.moduleID?.value,
      companyId: this.subModuleForm.get('companyName')?.value,
      code: this.subModuleForm.get('subModuleUrl')?.value.replace(/\s/g, '-'),
      adminUsers: this.subModuleForm.get('adminUsers')?.value?.map(data => data?.id),
      viewOnlyUsers: this.subModuleForm.get('viewOnlyUsers')?.value?.map(data => data?.id),
      formIds: this.formComponents,
      steps: this.workflows?.value?.map(data => {
        return {
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
    this.dashboard.createSubModule(payload).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if(res) {
        this.isCreatingSubModule.next(false);
        this.transportService.saveDraftLocally({});
        this.transportService.sendFormBuilderData([{title: '', key: '', display: '', components: []}]);
        this.router.navigate(['/dashboard/home']);
      }
      else {
        this.isCreatingSubModule.next(false);
      }
    })
  }

  dataSubmitValidation() {
    if(
      this.f['subModuleUrl']?.invalid ||
      this.f['companyName']?.invalid ||
      this.f['adminUsers']?.value?.length == 0 ||
      this.f['viewOnlyUsers']?.value?.length == 0 ||
      this.workflows?.length == 0 ||
      Object.values(this.formComponents)[0]?.components?.length == 0
    ) {
      return false
    }
    return true
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

  setAdminUsers(users: string[]) {
    this.subModuleForm?.get('adminUsers')?.setValue(users)
  }

  setViewUsers(users: string[]) {
    this.subModuleForm?.get('viewOnlyUsers')?.setValue(users)
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe()
  }
}
