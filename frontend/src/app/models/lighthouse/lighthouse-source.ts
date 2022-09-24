export class LighthouseSource {
  oauth_authorization_endpoint: string
  oauth_token_endpoint: string
  oauth_registration_endpoint: string
  oauth_introspection_endpoint: string
  oauth_userinfo_endpoint: string
  oauth_token_endpoint_auth_methods_supported: string

  api_endpoint_base_url: string
  response_type: string
  client_id: string
  scopes: string[]
  redirect_uri: string
  aud: string

  confidential: boolean
}
