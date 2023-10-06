import {CodableConceptModel} from './codable-concept-model';

export interface IdentifierModel {
  use: string
  type?: CodableConceptModel
  system?: string
  value?: string
}
