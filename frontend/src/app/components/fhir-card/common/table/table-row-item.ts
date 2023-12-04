import {ReferenceModel} from '../../../../../lib/models/datatypes/reference-model';
import {CodingModel} from '../../../../../lib/models/datatypes/coding-model';
import {CodableConceptModel} from '../../../../../lib/models/datatypes/codable-concept-model';

export class TableRowItem {
  label?: string
  data?: string | ReferenceModel | CodingModel | CodingModel[] | CodableConceptModel
  data_type?: TableRowItemDataType
  enabled?: boolean //determine if this row should be displayed
}

export enum TableRowItemDataType {
  String = "string",
  Reference = "reference",
  Coding = "coding",
  CodingList = "codingList",
  CodableConcept = "codableConcept",
}
