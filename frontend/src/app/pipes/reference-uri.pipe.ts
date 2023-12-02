import { Pipe, PipeTransform } from '@angular/core';
import {generateReferenceUriFromResourceOrReference} from '../../lib/utils/bundle_references';
import {FastenDisplayModel} from '../../lib/models/fasten/fasten-display-model';
import {Reference, Resource} from 'fhir/r4';

@Pipe({
  name: 'referenceUri'
})
export class ReferenceUriPipe implements PipeTransform {

  transform(value: FastenDisplayModel | Resource | Reference, ...args: unknown[]): unknown {
    if (!value) {
      return value
    }
    return generateReferenceUriFromResourceOrReference(value)
  }

}
