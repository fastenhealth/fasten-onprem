import {PatientAccessEndpoint} from '../patient-access-brands';

export class LighthouseSourceMetadata extends PatientAccessEndpoint {
  brand_id: string
  portal_id: string
//  endpoint_id = embedded PatientAccessEndpoint.id

  scopes_supported: string[]
  grant_types_supported: string[]
  response_types_supported: string[]
  response_modes_supported: string[]
  code_challenge_methods_supported: string[]

  confidential: boolean
  dynamic_client_registration_mode: string
  cors_relay_required: boolean

  issuer: string
  aud: string


  platform_type: string
  client_id: string
  redirect_uri: string


}
