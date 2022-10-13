import {IClient} from '../interface';
import {FHIR401Client} from './base/fhir401_r4_client';
import {Source} from '../../models/database/source';

export class CignaClient  extends FHIR401Client implements IClient {
  constructor(source: Source) {
    super(source);
  }

}
