/* eslint-disable @typescript-eslint/no-explicit-any */
import { SignInResponse } from './sign-in-response.model';

/**
 * @ignore
 */
export interface Response {
  status: boolean;
  data: SignInResponse | any;
}

/**
 * @ignore
 */
export class ApiResponse<T> {
  headers: any;
  constructor() {
    this.errors = [];
  }
  status!: boolean;
  data!: T;
  errors?: ApiError[] | any;
  getErrorsText(): string {
    return this.errors.map((e:any) => e.text).join(' ');
  }
  hasErrors(): boolean {
    return this.errors.length > 0;
  }
}

/**
 * @ignore
 */
export class ApiError {
  code!: ErrorCode;
  text!: string;
}

/**
 * @ignore
 */
export enum ErrorCode {
  UnknownError = 1,
  OrderIsOutdated = 2
}