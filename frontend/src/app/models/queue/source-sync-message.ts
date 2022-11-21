import {Source} from '../../models/fasten/source';

export class SourceSyncMessage {
  source: Source
  current_user: string
  auth_token: string
  couchdb_endpoint_base: string
  fasten_api_endpoint_base: string
  response?: any
}
