import {Source} from '../../../lib/models/database/source';

export class SourceSyncMessage {
  source: Source
  current_user: string

  response?: any
}
