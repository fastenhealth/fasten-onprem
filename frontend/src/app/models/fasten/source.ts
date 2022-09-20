export class Source {
  id?: string
  user_id?: number
  source_type: string
  patient_id: string

  oauth_authorization_endpoint: string
  oauth_token_endpoint: string
  oauth_registration_endpoint: string
  oauth_introspection_endpoint: string
  oauth_token_endpoint_auth_methods_supported: string

  api_endpoint_base_url:   string
  client_id:             string
  redirect_uri:          string
  scopes:               string //space seperated string
  access_token:          string
  refresh_token:         string
  id_token:              string
  expires_at:            number
  code_challenge:        string
  code_verifier:         string
}
