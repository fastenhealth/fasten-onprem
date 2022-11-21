import {LighthouseSourceMetadata} from '../lighthouse/lighthouse-source-metadata';

export class Source extends LighthouseSourceMetadata{
  id?: string
  user_id?: number
  source_type: string

  patient: string
  access_token:          string
  refresh_token?:         string
  id_token?:              string
  expires_at:            number //seconds since epoch

  constructor(object: any) {
    super()
    return Object.assign(this, object)
  }
}
