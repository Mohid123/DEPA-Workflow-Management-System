/**
 * @ignore
 */
export class BaseModel {
  revisionNo: number;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  status: status
}

/**
 * @ignore
 */
enum status {
  active = 1,
  deleted = 2
}