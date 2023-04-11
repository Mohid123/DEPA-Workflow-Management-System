import { BaseModel } from "src/core/models/base.model";

export class Module extends BaseModel {
  code: string;
  title: string;
  description: string;
  url: string;
  image: string;
}