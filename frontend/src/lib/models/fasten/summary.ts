import {Source} from '../database/source';
import {ResourceTypeCounts} from './source-summary';
import {ResourceFhir} from '../database/resource_fhir';

export class Summary {
  sources: Source[]
  patients: ResourceFhir[]
  resource_type_counts: ResourceTypeCounts[]
}
