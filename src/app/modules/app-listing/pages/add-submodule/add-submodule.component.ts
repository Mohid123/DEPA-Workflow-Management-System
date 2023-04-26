import { Component, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormioOptions } from '@formio/angular';
import { AuthService } from 'src/app/modules/auth/auth.service';
import { options } from 'src/app/modules/form-builder/options';
import { DataTransportService } from 'src/core/core-services/data-transport.service';

@Component({
  templateUrl: './add-submodule.component.html',
  styleUrls: ['./add-submodule.component.scss']
})
export class AddSubmoduleComponent {
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
  formTabs: any[] = []

  constructor(
    private fb: FormBuilder,
    public auth: AuthService,
    private transportService: DataTransportService,
    private router: Router
  ) {
    this.options = options;
    this.formComponents = this.transportService.formBuilderData.value;
    this.formTabs = this.formComponents.map(val => val.formTitle);
    this.submoduleFromLS = this.transportService.subModuleDraft.value;
    this.initSubModuleForm(this.submoduleFromLS);
  }

  initSubModuleForm(item?: any) {
    this.subModuleForm = this.fb.group({
      subModuleUrl: [item?.subModuleUrl || '', Validators.compose([Validators.required, Validators.pattern(/^(http|https)\:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}$/)])],
      companies: this.fb.array([]),
      companyName: [item?.companyName || '', Validators.required],
      workflows: this.fb.array(
        item?.workflows?.map((val: { condition: any; approvers: any; }) => {
          return this.fb.group({
            condition: [val.condition, Validators.required],
            approvers: [val.approvers, Validators.required]
          })
        })
        ||
        [
          this.fb.group({
            condition: ['', Validators.required],
            approvers: [[], Validators.required]
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
      approvers: [[], Validators.required]
    });
    this.workflows.push(workflowStepForm)
  }

  removeWorkflowStep(index: number) {
    this.workflows.removeAt(index);
  }

  submitNewCompany() {
    console.log(this.f["companies"]?.value)
  }

  saveDraft() {
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
}
