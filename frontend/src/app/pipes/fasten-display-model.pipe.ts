import { Pipe, PipeTransform } from '@angular/core';
import {DomainResource} from 'fhir/r4';
import {ResourceFhir} from '../models/fasten/resource_fhir';
import {FastenDisplayModel} from '../../lib/models/fasten/fasten-display-model';
import {fhirModelFactory, wrapFhirModel} from '../../lib/models/factory';
import {ResourceType} from '../../lib/models/constants';

@Pipe({
  name: 'fastenDisplayModel'
})
export class FastenDisplayModelPipe implements PipeTransform {

  transform(fhirResourceOrWrapper: any, ...args: unknown[]): FastenDisplayModel | any {
    if(!fhirResourceOrWrapper) {
      throw new Error("resource data cannot be empty")
    }

    if((fhirResourceOrWrapper as DomainResource).resourceType && (fhirResourceOrWrapper as DomainResource).id) {
      //wrap
      fhirResourceOrWrapper = wrapFhirModel(fhirResourceOrWrapper as DomainResource)
    }

    if((fhirResourceOrWrapper as ResourceFhir).resource_raw) {
      return fhirModelFactory((fhirResourceOrWrapper as ResourceFhir).source_resource_type as ResourceType, fhirResourceOrWrapper as ResourceFhir)
    } else {
      throw new Error("resource data must be a valid wrapped FHIR resource")
    }
  }

}
