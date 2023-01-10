import {fhirVersions, ResourceType} from '../constants';
import * as _ from "lodash";
import {CodableConceptModel, hasValue} from '../datatypes/codable-concept-model';
import {ReferenceModel} from '../datatypes/reference-model';
import {CodingModel} from '../datatypes/coding-model';
import {FastenDisplayModel} from '../fasten/fasten-display-model';
import {FastenOptions} from '../fasten/fasten-options';

export class ImmunizationModel extends FastenDisplayModel {

  title: string | undefined
  status: string | undefined
  provided_date: string | undefined
  manufacturer_text: string | undefined
  has_lot_number: boolean | undefined
  lot_number: string | undefined
  lot_number_expiration_date: string | undefined
  has_dose_quantity: boolean | undefined
  dose_quantity: CodingModel | undefined
  requester: string | undefined
  reported: string | undefined
  performer: string | undefined
  route: CodingModel[] | undefined
  has_route: boolean | undefined
  site: CodingModel[] | undefined
  has_site: boolean | undefined
  patient: ReferenceModel | undefined
  note: any[] | undefined

  constructor(fhirResource: any, fhirVersion?: fhirVersions, fastenOptions?: FastenOptions) {
    super(fastenOptions)
    this.source_resource_type = ResourceType.Immunization
    this.resourceDTO(fhirResource, fhirVersion || fhirVersions.R4);
  }


  commonDTO(fhirResource:any){
    this.title =
      _.get(fhirResource, 'vaccineCode.text') ||
      _.get(fhirResource, 'vaccineCode.coding[0].display', 'Immunization');
    this.status = _.get(fhirResource, 'status', null);
    this.provided_date = _.get(fhirResource, 'date', null);
    this.reported = _.get(fhirResource, 'reported') && ' - self reported';
    this.manufacturer_text = _.get(fhirResource, 'manufacturer.display');
    this.has_lot_number = _.has(fhirResource, 'lotNumber');
    this.lot_number = _.get(fhirResource, 'lotNumber');
    this.lot_number_expiration_date = _.get(fhirResource, 'expirationDate');
    this.has_dose_quantity = _.has(fhirResource, 'doseQuantity');
    this.dose_quantity = _.get(fhirResource, 'doseQuantity');
    this.requester = _.get(fhirResource, 'requester');
    this.route = _.get(fhirResource, 'route.coding');
    this.has_route = Array.isArray(this.route);
    this.site = _.get(fhirResource, 'site.coding');
    this.has_site = Array.isArray(this.site);
    this.patient = _.get(fhirResource, 'patient');
    this.note = _.get(fhirResource, 'note');
  };
  dstu2DTO(fhirResource:any){
    this.performer = _.get(fhirResource, 'performer');
  };
  stu3DTO(fhirResource:any){
    this.performer = _.get(fhirResource, 'practicioner.actor');
  };

  r4DTO(fhirResource:any){
    this.performer = _.get(fhirResource, 'performer.actor');
    this.provided_date =
      _.get(fhirResource, 'occurrenceDateTime') ||
      _.get(fhirResource, 'occurrenceString');
  };

  resourceDTO(fhirResource:any, fhirVersion:fhirVersions){
    switch (fhirVersion) {
      case fhirVersions.DSTU2: {
        this.commonDTO(fhirResource)
        this.dstu2DTO(fhirResource)
        return;
      }
      case fhirVersions.STU3: {
        this.commonDTO(fhirResource)
        this.stu3DTO(fhirResource)
        return
      }
      case fhirVersions.R4: {
        this.commonDTO(fhirResource)
        this.r4DTO(fhirResource)
        return
      }

      default:
        throw Error('Unrecognized the fhir version property type.');
    }
  };
}
