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

export const getUniqueListBy = (arr: any, key: any): any => {
  return [...new Map(arr.map((item: any) => [item[key], item])).values()]
}

export class CodeValidator {
  static createValidator(dashboard: DashboardService, model: string, key?: string, typedVal?: string): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors> => {
      if (!control.valueChanges || control.pristine) {
        return of(null);
      }
      else {
        return control.valueChanges.pipe(
          debounceTime(400),
          distinctUntilChanged(),
          switchMap(value => dashboard.validateModuleCode(value, model, key, typedVal)),
          map((res: ApiResponse<any>) => (res.data == false ? {codeExists: true} : null)),
          first()
        )
      }
    }
  }
}

export const convertStringToKeyValuePairs = (inputString, value) => {
  const keys = inputString.split('.');
  if (keys.length === 1) {
    return { [keys[0]]: value };
  }

  const key = keys.shift();
  return {
    [key]: convertStringToKeyValuePairs(keys.join('.'), value)
  };
}

export const generateKeyCombinations = (inputObject) => {
  const keys = Object.keys(inputObject);
  const firstKey = keys[0];
  const restKeys = Object.keys(inputObject[firstKey]);
  let combinations = [];
  restKeys.forEach(key => {
    combinations.push(`${firstKey}.${key}`);
  });
  combinations = combinations.filter(val => (
    val !== `${firstKey}.panel` &&
    val !== `${firstKey}.html` &&
    val !== `${firstKey}.content` &&
    val !== `${firstKey}.fieldSet` &&
    val !== `${firstKey}.columns` &&
    val !== `${firstKey}.panel` &&
    val !== `${firstKey}.table` &&
    val !== `${firstKey}.tabs` &&
    val !== `${firstKey}.container` &&
    val !== `${firstKey}.dataMap` &&
    val !== `${firstKey}.dataGrid` &&
    val !== `${firstKey}.editGrid` &&
    val !== `${firstKey}.tree`
  ))
  return combinations;
}

export class FormKeyValidator {
  static createValidator(dashboard: DashboardService): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors> => {
      if (!control.valueChanges || control.pristine) {
        return of(null);
      }
      else {
        return control.valueChanges.pipe(
          debounceTime(400),
          distinctUntilChanged(),
          switchMap(value => dashboard.validateFormCode(value?.replace(/\s/g, '-').toLowerCase())),
          map((res: ApiResponse<any>) => (res.data?.isKeyTaken == true ? {codeExists: true} : null)),
          first()
        )
      }
    }
  }
}