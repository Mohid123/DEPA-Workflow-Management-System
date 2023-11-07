import { AbstractControl, AsyncValidatorFn, ValidationErrors } from "@angular/forms";
import { Observable, debounceTime, distinctUntilChanged, first, map, of, switchMap } from "rxjs";
import { ApiResponse } from "../models/api-response.model";
import { DashboardService } from "src/app/modules/dashboard/dashboard.service";

/**
 * Function for calculating the aspect ratio of the selected image
 * @param image Image
 * @returns Promise of type boolean
 */
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

/**
 * Calculates file size and checks if it matches the required file size specs
 * @param file File
 * @returns Boolean
 */
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

/**
 * Function for filtering out duplicate values from an array of objects
 * @param arr Array of Objects
 * @param key Object key as a string
 * @returns New Array that has only unique values
 */
export const getUniqueListBy = (arr: any, key: any): any => {
  return [...new Map(arr.map((item: any) => [item[key], item])).values()]
}

/**
 * Class that handles the api calls for validation of existing key/code in apps/submodules
 */
export class CodeValidator {
  /**
   * Static method for valiating app keys/codes
   * @param dashboard The dashboard service class
   * @param model string
   * @param key string
   * @param typedVal string
   * @returns An asynchronous validator function that returns true or false based on provided criteria
   */
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

/**
 * Function to convert strings to key value pairs in an object
 * @param inputString string
 * @param value Value to assign to the string key
 * @returns Object
 */
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

/**
 * Method for creating key combinations for Summary Schema fields
 * @param inputObject Object to generate keys from
 * @returns Array of combinations of key and values
 */
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
    val !== `${firstKey}.editGrid.dataGrid` &&
    val !== `${firstKey}.tree`
  ))
  return combinations;
}

/**
 * Class that handles the api calls for validation of existing key/code in forms
 */
export class FormKeyValidator {
  /**
   * Static method for valiating app/form keys/codes
   * @param dashboard The dashboard service class
   * @returns An asynchronous validator function that returns true or false based on provided criteria
   */
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