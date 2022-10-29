import {Source} from '../../../lib/models/database/source';

export class SourceSyncMessage {
  source: Source
  current_user: string
  couchdb_endpoint_base: string

  response?: any
}
