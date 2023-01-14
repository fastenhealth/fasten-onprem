import {ReferenceModel} from '../../../../../lib/models/datatypes/reference-model';
import {CodingModel} from '../../../../../lib/models/datatypes/coding-model';

export class TableRowItem {
  label?: string
  data?: string | ReferenceModel | CodingModel | CodingModel[]
  data_type?: TableRowItemDataType
  enabled?: boolean //determine if this row should be displayed
}

export enum TableRowItemDataType {
  string = "string",
  Reference = "reference",
  Coding = "coding",
  CodingList = "codingList"
}
