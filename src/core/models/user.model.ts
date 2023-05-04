import { BaseModel } from "./base.model";

/**
 * @ignore
 */
export class User extends BaseModel {
  id: string;
  username: string;
  fullName: string;
  email: string;
  password: string;
  role: role;
  image: string;
  authenticatedBy: string;
  supervisorGID: string;
}

/**
 * @ignore
 */
enum role {
  Admin = 'admin',
  Authenticated = 'authenticated'
}