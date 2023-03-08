import { User } from "src/core/models/user.model";

export class RegisterModel extends User {
  setModel(_model: unknown) {
    const model = _model as RegisterModel;
    this.userName = model.userName || '';
    this.email = model.email || '';
    this.password = model.password || '';
  }
}