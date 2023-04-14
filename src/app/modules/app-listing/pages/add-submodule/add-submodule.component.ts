import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/modules/auth/auth.service';

@Component({
  templateUrl: './add-submodule.component.html',
  styleUrls: ['./add-submodule.component.scss']
})
export class AddSubmoduleComponent {
  subModuleForm!: FormGroup;
  readonly categoryOptions = [
    'Human Resources',
    'Networking',
    'Games',
    'E-Commerce',
    'Finance',
    'Management'
  ];

  constructor(private fb: FormBuilder, public auth: AuthService) {
    this.initSubModuleForm();
  }

  initSubModuleForm() {
    this.subModuleForm = this.fb.group({
      subModuleUrl: ['', Validators.required],
      companies: this.fb.array([]),
      companyName: ['', Validators.required]
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

  submitNewCompany() {

  }
}
