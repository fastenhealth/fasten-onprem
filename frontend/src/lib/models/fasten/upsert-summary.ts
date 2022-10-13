import {Source} from '../database/source';
import {ResourceFhir} from '../database/resource_fhir';
import {ResourceTypeCounts} from './source-summary';

export class UpsertSummary {
  updatedResources: string[] = []
  totalResources: number = 0
}
