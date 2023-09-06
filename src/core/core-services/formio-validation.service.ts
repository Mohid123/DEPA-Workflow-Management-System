import { Injectable } from '@angular/core';
import { FormioComponent } from '@formio/angular';

@Injectable({
  providedIn: 'root',
})
export class FormioService {
  private formioInstances: FormioComponent[] = [];

  // Register a Form.io instance
  registerFormioInstance(instance: FormioComponent) {
    this.formioInstances.push(instance);
  }

  // Get a Form.io instance by index
  getFormioInstance(index: number): FormioComponent | undefined {
    return this.formioInstances[index];
  }

  // Validate a specific form by index
  validateForm(index: number): boolean {
    const formioInstance = this.formioInstances[index];
    if (formioInstance?.formio) {
      const isValid = formioInstance.formio.checkValidity();
      console.log(`Form ${index + 1} validity:`, isValid);
      return isValid;
    }
    return false;
  }

  // Validate all forms
  validateAllForms(): boolean {
    let allFormsValid = true;
    this.formioInstances.forEach((instance, index) => {
      const isValid = this.validateForm(index);
      if (!isValid) {
        allFormsValid = false;
      }
    });
    return allFormsValid;
  }
}
