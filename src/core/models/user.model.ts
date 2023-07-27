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
  roles: string[];
  image: string;
  authenticatedBy: string;
  supervisorGID: string;
}