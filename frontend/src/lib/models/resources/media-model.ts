import {FastenDisplayModel} from '../fasten/fasten-display-model';
import {CodableConceptModel} from '../datatypes/codable-concept-model';
import {ReferenceModel} from '../datatypes/reference-model';
import {BinaryModel} from './binary-model';
import {fhirVersions, ResourceType} from '../constants';
import {FastenOptions} from '../fasten/fasten-options';
import * as _ from "lodash";


export class MediaModel extends FastenDisplayModel {
  status: string
  type: CodableConceptModel
  reasonCode: CodableConceptModel[]
  deviceName: string
  device: ReferenceModel
  height: number
  width: number
  description: string
  content: BinaryModel


  constructor(fhirResource: any, fhirVersion?: fhirVersions, fastenOptions?: FastenOptions) {
    super(fastenOptions)
    this.source_resource_type = ResourceType.Media

    this.status = _.get(fhirResource, 'status');
    this.type = new CodableConceptModel(_.get(fhirResource, 'type'));
    this.reasonCode = (_.get(fhirResource, 'reasonCode') || []).map((_reasonCode: any) => new CodableConceptModel(_reasonCode));
    this.deviceName = _.get(fhirResource, 'deviceName');
    this.device = _.get(fhirResource, 'device');
    this.height = _.get(fhirResource, 'height');
    this.width = _.get(fhirResource, 'width');
    this.description = _.get(fhirResource, 'note');
    this.content = new BinaryModel(_.get(fhirResource, 'content'));
  }
}
