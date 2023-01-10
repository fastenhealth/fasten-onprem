import {fhirVersions} from '../constants';
import * as _ from "lodash";
import {CodableConceptModel, hasValue} from '../datatypes/codable-concept-model';
import {ReferenceModel} from '../datatypes/reference-model';
import {CodingModel} from '../datatypes/coding-model';
import {FastenDisplayModel} from '../fasten/fasten-display-model';
import {FastenOptions} from '../fasten/fasten-options';

export class AppointmentModel extends FastenDisplayModel {

  description: string|undefined
  status: string|undefined
  start: string|undefined
  typeCoding: string|undefined
  comment: string|undefined
  participant: string|undefined
  participantPatient: string|undefined
  participantPractitioner: string|undefined
  participantLocation: string|undefined
  minutesDuration: string|undefined
  reason: string|undefined
  cancelationReason: string|undefined
  serviceCategory: string|undefined

  constructor(fhirResource: any, fhirVersion?: fhirVersions, fastenOptions?: FastenOptions) {
    super(fastenOptions)
    this.resourceDTO(fhirResource, fhirVersion || fhirVersions.R4);
  }


  commonDTO(fhirResource:any) {
    this.description = _.get(fhirResource, 'description');
    this.status = _.get(fhirResource, 'status');
    this.start = _.get(fhirResource, 'start');
    this.typeCoding = _.get(fhirResource, 'type.coding');
    this.comment = _.get(fhirResource, 'comment');
    this.participant = _.get(fhirResource, 'participant');
    // const {
    //   participantPatient,
    //   participantPractitioner,
    //   participantLocation,
    // } = prepareParticipantData(participant);
    this.minutesDuration = _.get(fhirResource, 'minutesDuration');
    this.reason = _.get(fhirResource, 'reason', []);
  };

  stu3DTO(fhirResource:any) {
    this.serviceCategory = _.get(fhirResource, 'serviceCategory', []);
    this.typeCoding = _.get(fhirResource, 'appointmentType.coding');
  };

  r4DTO(fhirResource:any) {
    this.reason = _.get(fhirResource, 'reasonCode', []);
    this.cancelationReason = _.get(fhirResource, 'cancelationReason', []);
    this.serviceCategory = _.get(fhirResource, 'serviceCategory', []);
    this.typeCoding = _.get(fhirResource, 'appointmentType.coding');
  };

  resourceDTO(fhirResource:any, fhirVersion:fhirVersions){
    switch (fhirVersion) {
      case fhirVersions.DSTU2: {
        this.commonDTO(fhirResource)
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



  // prepareParticipantData(data:any){
  //   let participantPatient = [];
  //   let participantPractitioner = [];
  //   let participantLocation = [];
  //   if (Array.isArray(data)) {
  //     data.forEach((item, i) => {
  //       if (_.get(item, 'actor.reference', '').includes('Patient')) {
  //         participantPatient.push(
  //           <div key={`item-${i}`}>
  //         <Reference fhirData={item.actor} />
  //         </div>,
  //       );
  //       } else if (_get(item, 'actor.reference', '').includes('Practitioner')) {
  //         participantPractitioner.push(
  //           <div key={`item-${i}`}>
  //         <Reference fhirData={item.actor} />
  //         </div>,
  //       );
  //       } else if (_get(item, 'actor.display', '')) {
  //         participantLocation.push(
  //           <div key={`item-${i}`}>
  //         <Reference fhirData={item.actor} />
  //         </div>,
  //       );
  //       }
  //     });
  //   }
  //   return {
  //     participantPatient:
  //       participantPatient.length > 0 ? participantPatient : <MissingValue />,
  //     participantPractitioner: participantPractitioner.length ? (
  //       participantPractitioner
  //     ) : (
  //       <MissingValue />
  //     ),
  //     participantLocation: participantLocation.length ? (
  //       participantLocation
  //     ) : (
  //       <MissingValue />
  //     ),
  //   };
  // };
}
