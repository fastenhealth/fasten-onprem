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
  providedDate: string | undefined
  manufacturerText: string | undefined
  hasLotNumber: boolean | undefined
  lotNumber: string | undefined
  lotNumberExpirationDate: string | undefined
  hasDoseQuantity: boolean | undefined
  doseQuantity: CodingModel | undefined
  requester: string | undefined
  reported: string | undefined
  performer: string | undefined
  route: CodingModel[] | undefined
  hasRoute: boolean | undefined
  site: CodingModel[] | undefined
  hasSite: boolean | undefined
  patient: ReferenceModel | undefined
  note: any[] | undefined

  constructor(fhirResource: any, fhirVersion?: fhirVersions, fastenOptions?: FastenOptions) {
    super(fastenOptions)
    this.resourceType = ResourceType.Immunization
    this.resourceDTO(fhirResource, fhirVersion || fhirVersions.R4);
  }


  commonDTO(fhirResource:any){
    this.title =
      _.get(fhirResource, 'vaccineCode.text') ||
      _.get(fhirResource, 'vaccineCode.coding[0].display', 'Immunization');
    this.status = _.get(fhirResource, 'status', null);
    this.providedDate = _.get(fhirResource, 'date', null);
    this.reported = _.get(fhirResource, 'reported') && ' - self reported';
    this.manufacturerText = _.get(fhirResource, 'manufacturer.display');
    this.hasLotNumber = _.has(fhirResource, 'lotNumber');
    this.lotNumber = _.get(fhirResource, 'lotNumber');
    this.lotNumberExpirationDate = _.get(fhirResource, 'expirationDate');
    this.hasDoseQuantity = _.has(fhirResource, 'doseQuantity');
    this.doseQuantity = _.get(fhirResource, 'doseQuantity');
    this.requester = _.get(fhirResource, 'requester');
    this.route = _.get(fhirResource, 'route.coding');
    this.hasRoute = Array.isArray(this.route);
    this.site = _.get(fhirResource, 'site.coding');
    this.hasSite = Array.isArray(this.site);
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
    this.providedDate =
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
