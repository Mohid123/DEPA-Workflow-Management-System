import { BaseModel } from "./base.model";

/**
 * User type definition
 * @typedef User
 * @extends BaseModel
 */
export class User extends BaseModel {
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
 * @enum role
 */
enum role {
  Admin = 'admin',
  Authenticated = 'authenticated'
}