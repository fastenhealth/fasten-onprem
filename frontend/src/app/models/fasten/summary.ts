import {Source} from './source';
import {ResourceTypeCounts} from './source-summary';
import {ResourceFhir} from './resource_fhir';

export class Summary {
  sources: Source[]
  patients: ResourceFhir[]
  resource_type_counts: ResourceTypeCounts[]
}
