import {Source} from './source';

export class ResourceTypeCounts {
  count: number
  source_id: string
  resource_type: string
}

export class SourceSummary {
  source: Source
  resource_type_counts: ResourceTypeCounts[]
}
