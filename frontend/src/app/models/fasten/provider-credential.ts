export class ProviderCredential {
  user_id?: number
  provider_id: string
  patient_id: string

  oauth_endpoint_base_url: string
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
