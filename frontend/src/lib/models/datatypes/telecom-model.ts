export interface TelecomModel {
  system: 'phone' | 'fax' | 'email' | 'url' | 'other'
  value: string
  use?: string
}
