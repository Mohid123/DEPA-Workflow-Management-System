import { User } from './user.model';

/**
 * @ignore
 */
export interface SignInResponse {
  user:   User;
  token:  string;
}