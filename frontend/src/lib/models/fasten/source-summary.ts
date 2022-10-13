import {Source} from '../database/source';
import {ResourceFhir} from '../database/resource_fhir';

export class ResourceTypeCounts {
  count: number
  source_id: string
  resource_type: string
}

export class SourceSummary {
  source: Source
  resource_type_counts: ResourceTypeCounts[]
  patient?: ResourceFhir
}
