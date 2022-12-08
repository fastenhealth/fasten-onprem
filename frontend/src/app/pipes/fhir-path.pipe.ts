import { Pipe, PipeTransform } from '@angular/core';
import {ResourceFhir} from '../models/fasten/resource_fhir';
import { evaluate } from 'fhirpath'

@Pipe({
  name: 'fhirPath'
})
export class FhirPathPipe implements PipeTransform {

  transform(resourceFhir: ResourceFhir, query: string): string {
    return evaluate(resourceFhir.resource_raw, query).join(", ");
  }

}
