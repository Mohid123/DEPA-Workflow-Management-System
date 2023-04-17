import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/modules/auth/auth.service';
import { DataTransportService } from 'src/core/core-services/data-transport.service';
import { StorageItem, getItem, setItem } from 'src/core/utils/local-storage.utils';

@Component({
  templateUrl: './add-submodule.component.html',
  styleUrls: ['./add-submodule.component.scss']
})
export class AddSubmoduleComponent {
  subModuleForm!: FormGroup;
  submoduleFromLS: any;
  formComponents: any;
  readonly categoryOptions = [
    'Human Resources',
    'Networking',
    'Games',
    'E-Commerce',
    'Finance',
    'Management'
  ];

  constructor(private fb: FormBuilder, public auth: AuthService, private transportService: DataTransportService) {
    this.formComponents = this.transportService.formBuilderData.value
    console.log(this.formComponents)
    this.submoduleFromLS = getItem(StorageItem.subModuleData);
    this.initSubModuleForm(this.submoduleFromLS);
  }

  initSubModuleForm(item?: any) {
    this.subModuleForm = this.fb.group({
      subModuleUrl: [item?.subModuleUrl || '', Validators.required],
      companies: this.fb.array([]),
      companyName: [item?.companyName || '', Validators.required]
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
    console.log(this.f["companies"]?.value)
  }

  saveDraft() {
    setItem(StorageItem.subModuleData, this.subModuleForm.value);
  }
}
