import { Component, EventEmitter, HostListener, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormioOptions } from '@formio/angular';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { subModuleForm } from 'src/app/forms/forms';
import { AuthService } from 'src/app/modules/auth/auth.service';
import { DashboardService } from 'src/app/modules/dashboard/dashboard.service';
import { options } from 'src/app/modules/form-builder/options';
import { DataTransportService } from 'src/core/core-services/data-transport.service';

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
  readonly categoryOptions = [
    'Human Resources',
    'Networking',
    'Games',
    'E-Commerce',
    'Finance',
    'Management'
  ];
  langItems = [{name: 'en',}, {name: 'ar'}];
  languageForm = new FormGroup({
    languages: new FormControl(this.langItems[0]),
  });

  readonly approverNames = [
    'Ahtasham',
    'Fida',
    'Fadii',
    'Tabii',
    'Jani'
  ];
  readonly conditions = [
    'OR',
    'AND',
    'ANY'
  ];
  formTabs: any[] = [];
  subModForm = subModuleForm;
  formOptions: any = {
    "disableAlerts": true
  };
  prePopulatedDataDetails: any;
  subModuleFormIoValue = new BehaviorSubject<any>({});
  destroy$ = new Subject();
  isCreatingSubModule = new Subject<boolean>();

  constructor(
    private fb: FormBuilder,
    public auth: AuthService,
    private transportService: DataTransportService,
    private router: Router,
    private dashboard: DashboardService,
    private activatedRoute: ActivatedRoute
  ) {
    this.initSubModuleForm();
    this.submoduleFromLS = this.transportService.subModuleDraft.value;
    //get default workflow
    this.activatedRoute.queryParams.subscribe(val => {
      if(val['id']) {
        this.transportService.moduleID.next(val['id'])
        this.dashboard.getWorkflowFromModule(val['id']).subscribe((response: any) => {
          if(response) {
            this.initSubModuleForm(response)
          }
          if(Object.keys(this.submoduleFromLS)?.length > 0) {
            this.initSubModuleForm(this.submoduleFromLS);
          }
        })
      }
    });

    this.options = options;
    this.formComponents = this.transportService.formBuilderData.value;
    this.formTabs = this.formComponents.map(val => val.title);
    this.prePopulatedDataDetails = {
      "data": {
        "submoduleUrl": this.submoduleFromLS?.subModuleUrl,
        "companyName": this.submoduleFromLS?.companyName
      }
    };

    this.dashboard.getAllCompanies()
    .pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      const companies = res.results?.map(data => {
        return {
          value: data?.id,
          label: data?.title
        }
      });
      this.subModForm = {
        "title": "Submodule Form",
        "components": [
          {
              "label": "Submodule Url",
              "tableView": true,
              "validate": {
                  "required": true
              },
              "key": "submoduleUrl",
              "type": "url",
              "input": true
          },
          {
              "label": "Company Name",
              "widget": "html5",
              "tableView": true,
              "validate": {
                "required": true
              },
              "key": "companyName",
              "type": "select",
              "data": {
                "values": companies
              },
              "input": true
          }
        ]
      }
    })
  }

  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    event.preventDefault();
    event.returnValue = false;
  }

  initSubModuleForm(item?: any) {
    this.subModuleForm = this.fb.group({
      subModuleUrl: [item?.subModuleUrl || '', Validators.compose([Validators.required, Validators.pattern(/^(http|https)\:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}$/)])],
      companies: this.fb.array([]),
      companyName: [item?.companyName || '', Validators.required],
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
            condition: ['', Validators.required],
            approverIds: [[], Validators.required]
          })
        ]
      )
    })
  }

  getFormIoValueOnChange(value: any) {
    this.subModuleFormIoValue.next(value?.data);
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
    console.log(this.f["companies"]?.value)
  }

  saveDraft() {
    this.subModuleForm.get('subModuleUrl')?.setValue(this.subModuleFormIoValue?.value.submoduleUrl)
    this.subModuleForm.get('companyName')?.setValue(this.subModuleFormIoValue?.value.companyName)
    this.transportService.isFormEdit.next(false);
    this.transportService.saveDraftLocally(this.subModuleForm.value);
    this.router.navigate(['/form-builder']);
  }

  sendFormForEdit(index: number) {
    this.transportService.isFormEdit.next(true);
    this.transportService.sendFormDataForEdit.next(this.formComponents[index]);
    this.transportService.saveDraftLocally(this.subModuleForm.value);
    this.router.navigate(['/form-builder']);
  }

  changeLanguage(lang: string) {
    this.language.emit(lang);
  }

  saveSubModule() {
    this.isCreatingSubModule = this.dashboard.creatingModule
    console.log(this.workflows?.value)
    const payload = {
      moduleId: this.transportService.moduleID?.value,
      companyId: this.subModuleForm.get('companyName')?.value,
      code: 'subMod' + '-' + Array(8).fill(null).map(() => Math.round(Math.random() * 4).toString(4)).join(''),
      adminUsers: this.subModuleForm.get('adminUsers')?.value?.map(data => data?.id),
      viewOnlyUsers: this.subModuleForm.get('viewOnlyUsers')?.value?.map(data => data?.id),
      formIds: this.formComponents,
      steps: this.workflows?.value
    }
    console.log('FINAL PAYLOAD', payload);
    this.dashboard.createSubModule(payload).pipe(takeUntil(this.destroy$)).subscribe()
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
