import {ResourceFhir} from './resource_fhir';

export class ResourceGraphResponse {
  results: {[resource_type: string]: ResourceFhir[]}
}
