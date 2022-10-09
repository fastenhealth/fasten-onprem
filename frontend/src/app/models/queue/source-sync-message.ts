import {Source} from '../../../lib/models/database/source';

export class SourceSyncMessage {
  source: Source
  userIdentifier: string
  encryptionKey?: string
}
