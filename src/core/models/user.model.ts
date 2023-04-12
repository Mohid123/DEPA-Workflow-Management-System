import { BaseModel } from "./base.model";

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

enum role {
  Admin = 'admin',
  Authenticated = 'authenticated'
}