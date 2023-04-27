import { BaseModel } from "./base.model";

export class WorkflowModel extends BaseModel {
  approverIds: string[];
  condition: Conditions
}

enum Conditions {
  AND = 'AND',
  OR = 'OR',
  ANY = 'ANY'
}