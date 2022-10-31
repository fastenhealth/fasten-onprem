export class SourceState {
  state: string

  source_type: string //used to override the source_type for sources which have a single redirect url (eg. Epic)
  code_verifier?: string
  code_challenge_method?: string
  code_challenge?: string
  enabled: boolean
  redirect_uri?: string
}
