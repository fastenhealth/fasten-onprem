export class AuthorizeClaim {
  source_type: string
  state:      string
  code?:       string
  ttl?:        number

  access_token?: string
  refresh_token?: string
  id_token?: string
  expires_at?: number
}
