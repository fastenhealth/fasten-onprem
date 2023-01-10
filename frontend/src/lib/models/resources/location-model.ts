import * as _ from "lodash";
import {AddressModel} from '../datatypes/address-model';
import {TelecomModel} from '../datatypes/telecom-model';
import {CodableConceptModel} from '../datatypes/codable-concept-model';
import {ReferenceModel} from '../datatypes/reference-model';
import {fhirVersions, ResourceType} from '../constants';
import {FastenDisplayModel} from '../fasten/fasten-display-model';
import {FastenOptions} from '../fasten/fasten-options';

export class LocationModel extends FastenDisplayModel {

  name: string
  status: string
  description: string
  address: AddressModel
  telecom: TelecomModel[]
  type: CodableConceptModel[]
  physicalType: CodableConceptModel
  mode: string
  managingOrganization: ReferenceModel

  constructor(fhirResource: any, fhirVersion?: fhirVersions, fastenOptions?: FastenOptions) {
    super(fastenOptions)
    this.resourceType = ResourceType.Location

    this.name = _.get(fhirResource, 'name');
    this.status = _.get(fhirResource, 'status');
    this.description = _.get(fhirResource, 'description');
    this.address = new AddressModel(_.get(fhirResource, 'address'));
    this.telecom = _.get(fhirResource, 'telecom');
    this.type = (_.get(fhirResource, 'type') || []).map((_type: any) => new CodableConceptModel(_type));
    this.physicalType = new CodableConceptModel(_.get(fhirResource, 'physicalType'));
    this.mode = _.get(fhirResource, 'mode');
    this.managingOrganization = _.get(fhirResource, 'managingOrganization');

  }
}
