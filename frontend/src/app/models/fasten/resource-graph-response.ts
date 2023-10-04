import {ResourceFhir} from './resource_fhir';

export class ResourceGraphResponse {
  results: {[resource_type: string]: ResourceFhir[]}
  metadata: ResourceGraphMetadata
}

export class ResourceGraphMetadata {
  total_elements: number
  page_size: number
  page: number
}
