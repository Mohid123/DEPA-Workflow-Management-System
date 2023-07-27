import { AbstractControl, AsyncValidatorFn, ValidationErrors } from "@angular/forms";
import { Observable, debounceTime, distinctUntilChanged, first, map, of, switchMap } from "rxjs";
import { ApiResponse } from "../models/api-response.model";
import { DashboardService } from "src/app/modules/dashboard/dashboard.service";

export const calculateAspectRatio = (image: any): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onload = async (e: any) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = async () => {
        let height = img.naturalHeight;
        let width = img.naturalWidth;
        if (Math.round(width / height) !== 1) {
          resolve(false);
        }
        resolve(true);
      };
    };
  });
}

export const calculateFileSize = (file: any): boolean => {
  const maxSize = (1024 * 1024) * 2;
  if (
    (file?.type == 'image/jpg' ||
      file?.type == 'image/jpeg' ||
      file?.type == 'image/png' ||
      file?.type == 'image/webp') &&
    file?.size <= maxSize
  ) {
    return true;
  }
  return false;
}

export class CodeValidator {
  static createValidator(dashboard: DashboardService): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors> => {
      if (!control.valueChanges || control.pristine) {
        return of(null);
      }
      else {
        return control.valueChanges.pipe(
          debounceTime(400),
          distinctUntilChanged(),
          switchMap(value => dashboard.validateModuleCode(value?.replace(/\s/g, '-').toLowerCase())),
          map((res: ApiResponse<any>) => (res.data?.isCodeTaken == true ? {codeExists: true} : null)),
          first()
        )
      }
    }
  }
}