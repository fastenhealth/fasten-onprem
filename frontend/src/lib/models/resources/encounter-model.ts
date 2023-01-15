import {fhirVersions, ResourceType} from '../constants';
import * as _ from "lodash";
import {CodableConceptModel, hasValue} from '../datatypes/codable-concept-model';
import {ReferenceModel} from '../datatypes/reference-model';
import {CodingModel} from '../datatypes/coding-model';
import {FastenDisplayModel} from '../fasten/fasten-display-model';
import {FastenOptions} from '../fasten/fasten-options';

export class EncounterModel extends FastenDisplayModel {

  period_end: string | undefined
  period_start: string | undefined
  has_participant: boolean | undefined
  location_display: string | undefined
  encounter_type: CodableConceptModel[] | undefined
  resource_class: string | undefined
  resource_status: string | undefined
  participant: {
    display?: string,
    role?: string,
    reference?: string,
    text?: string,
    periodStart?:string
  }[] | undefined

  constructor(fhirResource: any, fhirVersion?: fhirVersions, fastenOptions?: FastenOptions) {
    super(fastenOptions)
    this.source_resource_type = ResourceType.Encounter
    this.resourceDTO(fhirResource, fhirVersion || fhirVersions.R4);
  }

  commonDTO(fhirResource:any){
    this.resource_status = _.get(fhirResource, 'status');
    this.location_display = _.get(
      fhirResource,
      'location[0].location.display',
      'Encounter',
    );
    this.encounter_type = _.get(fhirResource, 'type');
    this.has_participant = _.has(fhirResource, 'participant');
  };

  dstu2DTO(fhirResource:any){
    this.period_end = _.get(fhirResource, 'period.end');
    this.period_start = _.get(fhirResource, 'period.start');
    this.resource_class = _.get(fhirResource, 'class');
    this.participant = _.get(fhirResource, 'participant', []).map((item: any) => {
      let periodStart = _.get(item, 'period.start');
      periodStart = new Date(periodStart).toLocaleString();
      const reference = _.get(item, 'individual', {});
      return {
        display: _.get(item, 'type[0].coding[0].display'),
        reference: reference,
        text: _.get(item, 'type[0].text'),
        periodStart,
      };
    });
  };

  stu3DTO(fhirResource:any){
    this.period_end = _.get(fhirResource, 'period.end');
    this.period_start = _.get(fhirResource, 'period.start');


    this.resource_class = _.get(fhirResource, 'class.display');
    this.participant = _.get(fhirResource, 'participant', []).map((item: any) => {
      let periodStart = _.get(item, 'period.start');
      const reference = _.get(item, 'individual', {});
      return {
        display: _.get(item, 'type[0].coding[0].display'),
        reference: reference,
        text: _.get(item, 'type[0].text'),
        periodStart,
      };
    });
  };

  r4DTO(fhirResource:any){
    this.period_end = _.get(fhirResource, 'period.end');
    this.period_start = _.get(fhirResource, 'period.start');

    this.resource_class = _.get(fhirResource, 'class.display');
    this.participant = _.get(fhirResource, 'participant', []).map((item: any) => {
      let periodStart = _.get(item, 'period.start');
      return {
        role: _.get(item, 'type[0].text') || _.get(item, 'type[0].coding[0].display'),
        display: _.get(item, 'individual.display'),
        reference: _.get(item, 'individual.reference'),
        text: _.get(item, 'type[0].text'),
        periodStart,
      };
    });
  };

  resourceDTO(fhirResource:any, fhirVersion: fhirVersions){
    switch (fhirVersion) {
      case fhirVersions.DSTU2: {
        this.commonDTO(fhirResource)
        this.dstu2DTO(fhirResource)
        return
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
