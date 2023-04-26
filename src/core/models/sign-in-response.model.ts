import { User } from './user.model';

/**
 * Expected response from server after user authentication
 * @interface SignInResponse
 * @typedef SignInResponse
 */
export interface SignInResponse {
  user:   User;
  token:  string;
}