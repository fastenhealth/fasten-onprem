import {ReferenceModel} from '../datatypes/reference-model';
import {fhirVersions, ResourceType} from '../constants';
import {FastenOptions} from '../fasten/fasten-options';
import {FastenDisplayModel} from '../fasten/fasten-display-model';

export class BinaryModel extends FastenDisplayModel{

  content_type: string | undefined
  content: string | undefined  //decoded data
  data: string | undefined //raw base64 encoded data

  constructor(fhirResource: any, fhirVersion?: fhirVersions, fastenOptions?: FastenOptions) {
    super(fastenOptions)
    this.source_resource_type = ResourceType.Binary

    this.content = fhirResource.data ? atob(fhirResource.data) : '';
    this.data = fhirResource.data
    this.content_type = fhirResource.contentType
  }
}
