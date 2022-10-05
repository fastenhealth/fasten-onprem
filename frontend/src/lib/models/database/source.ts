import {LighthouseSourceMetadata} from '../lighthouse/lighthouse-source-metadata';
import {SourceType} from './types';
import {DocType} from '../../../lib/database/constants';

export class Source extends LighthouseSourceMetadata{
  _id?: string
  _rev?: string
  docType: string
  source_type: SourceType

  patient: string
  access_token:          string
  refresh_token?:         string
  id_token?:              string
  expires_at:            number //seconds since epoch

  constructor(object: any) {
    super()
    object.docType = DocType.Source
    return Object.assign(this, object)
  }

  populateId(){
    this._id = `source:${this.source_type}:${this.patient}`
  }
}
