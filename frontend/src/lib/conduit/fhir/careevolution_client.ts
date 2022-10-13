import {IClient} from '../interface';
import {FHIR401Client} from './base/fhir401_r4_client';
import {Source} from '../../models/database/source';

export class CareEvolutionClient  extends FHIR401Client implements IClient {
  constructor(source: Source) {
    super(source);
    //CareEvolution API requires the following Accept header for every request
    this.headers.set("Accept","application/json+fhir")
  }

}
