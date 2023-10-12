export class SourceState {
  state: string

  source_type: string //used to override the source_type for sources which have a single redirect url (eg. Epic)
  reconnect_source_id?: string //used to reconnect a source

  code_verifier?: string
  code_challenge_method?: string
  code_challenge?: string
  hidden: boolean
  redirect_uri?: string
}
