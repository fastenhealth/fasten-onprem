export class SourceState {
  state: string

  endpoint_id: string
  portal_id: string
  brand_id: string

  reconnect_source_id?: string //used to reconnect a source

  code_verifier?: string
  code_challenge_method?: string
  code_challenge?: string
  hidden: boolean
  redirect_uri?: string
}
