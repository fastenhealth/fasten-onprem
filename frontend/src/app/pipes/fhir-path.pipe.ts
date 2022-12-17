import { Pipe, PipeTransform } from '@angular/core';
import {ResourceFhir} from '../models/fasten/resource_fhir';
import { evaluate } from 'fhirpath'

@Pipe({
  name: 'fhirPath'
})
export class FhirPathPipe implements PipeTransform {

  transform(resourceFhir: ResourceFhir, ...pathQueryWithFallback: string[]): string {

    for(let pathQuery of pathQueryWithFallback){
      let result = evaluate(resourceFhir.resource_raw, pathQuery).join(", ")
      if(result){
        return result
      }
    }

    return null
  }

}
