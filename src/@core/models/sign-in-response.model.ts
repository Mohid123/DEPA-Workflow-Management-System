import { User } from './user.model';

export interface SignInResponse {
  user:   User;
  token:  string;
}
