import { BaseModel } from "src/core/models/base.model";
import { WorkflowModel } from "./workflow.model";

/**
 * @ignore
 */
export class Module extends BaseModel {
  categoryId: string;
  code: string;
  title: string;
  description: string;
  url: string;
  image: string;
  defaultWorkflowId: string;
  defaultWorkflow?: WorkflowModel
}