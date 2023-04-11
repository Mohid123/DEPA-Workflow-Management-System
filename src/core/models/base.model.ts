export class BaseModel {
  revisionNo: number;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  status: status
}

enum status {
  active = 1,
  deleted = 2
}