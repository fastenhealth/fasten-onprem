import {IdentifierModel} from './identifier-model';

export interface ReferenceModel {
  reference: string
  display?: string
  identifier?: IdentifierModel
}
