import {FastenDisplayModel} from '../fasten/fasten-display-model';
import {ReferenceModel} from '../datatypes/reference-model';
import {CodableConceptModel} from '../datatypes/codable-concept-model';
import {fhirVersions, ResourceType} from '../constants';
import {FastenOptions} from '../fasten/fasten-options';
import * as _ from "lodash";

export class CompositionModel  extends FastenDisplayModel {

  title: string | undefined
  relates_to: string | undefined

  constructor(fhirResource: any, fhirVersion?: fhirVersions, fastenOptions?: FastenOptions) {
    super(fastenOptions)
    this.source_resource_type = ResourceType.Composition

    this.title = _.get(fhirResource, 'title')
    this.relates_to = _.get(fhirResource, 'relatesTo', []).map((relatesTo) => {
      return relatesTo.target?.targetReference?.reference
    })
  }
}
