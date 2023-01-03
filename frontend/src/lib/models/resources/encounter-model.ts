import {fhirVersions} from '../constants';
import * as _ from "lodash";
import {CodableConceptModel, hasValue} from '../datatypes/codable-concept-model';
import {ReferenceModel} from '../datatypes/reference-model';
import {CodingModel} from '../datatypes/coding-model';

export class EncounterModel {
  periodEnd: string | undefined
  periodStart: string | undefined
  hasParticipant: boolean | undefined
  locationDisplay: string | undefined
  encounterType: CodableConceptModel[] | undefined
  resourceClass: string | undefined
  resourceStatus: string | undefined
  participant: {
    display?: string,
    reference: ReferenceModel,
    text?: string,
    periodStart?:string
  }[] | undefined

  constructor(fhirResource: any, fhirVersion?: fhirVersions) {
    this.resourceDTO(fhirResource, fhirVersion || fhirVersions.R4);
  }

  commonDTO(fhirResource:any){
    this.resourceStatus = _.get(fhirResource, 'status');
    this.locationDisplay = _.get(
      fhirResource,
      'location[0].location.display',
      'Encounter',
    );
    this.encounterType = _.get(fhirResource, 'type');
    this.hasParticipant = _.has(fhirResource, 'participant');
  };

  dstu2DTO(fhirResource:any){
    this.periodEnd = _.get(fhirResource, 'period.end');
    this.periodStart = _.get(fhirResource, 'period.start');
    this.resourceClass = _.get(fhirResource, 'class');
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
    this.periodEnd = _.get(fhirResource, 'period.end');
    this.periodStart = _.get(fhirResource, 'period.start');


    this.resourceClass = _.get(fhirResource, 'class.display');
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
    this.periodEnd = _.get(fhirResource, 'period.end');
    this.periodStart = _.get(fhirResource, 'period.start');

    this.resourceClass = _.get(fhirResource, 'class.display');
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
