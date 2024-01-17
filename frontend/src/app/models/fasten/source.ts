import {LighthouseSourceMetadata} from '../lighthouse/lighthouse-source-metadata';
import {BackgroundJob} from './background-job';

export class Source {
  id?: string
  created_at?: string
  updated_at?: string
  user_id?: number

  display?: string
  lighthouse_env_type?: 'prod' | 'sandbox'
  brand_id?: string
  portal_id?: string
  endpoint_id: string
  platform_type: string

  latest_background_job?: BackgroundJob

  patient: string
  client_id: string
  access_token:          string
  refresh_token?:         string
  id_token?:              string
  expires_at:            number //seconds since epoch


  dynamic_client_jwks?: any[]
  dynamic_client_id?: string

  constructor(object: Partial<Source>) {
    return Object.assign(this, object)
  }
}
