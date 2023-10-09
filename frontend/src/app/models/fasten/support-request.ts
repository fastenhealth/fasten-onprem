
export class SupportRequest {
  full_name: string
  email: string
  request_content: string

  current_page: string
  dist_type: 'desktop' | 'docker' | 'cloud'
  flavor: string
  version: string
  arch: string
  os: string
}
