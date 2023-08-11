import {fhirVersions, ResourceType} from '../constants';
import * as _ from "lodash";
import {CodableConceptModel, hasValue} from '../datatypes/codable-concept-model';
import {ReferenceModel} from '../datatypes/reference-model';
import {CodingModel} from '../datatypes/coding-model';
import {FastenDisplayModel} from '../fasten/fasten-display-model';
import {FastenOptions} from '../fasten/fasten-options';

export class AppointmentModel extends FastenDisplayModel {
  code: CodableConceptModel | undefined
  description: string|undefined
  status: string|undefined
  start: string|undefined
  type_coding: string|undefined
  comment: string|undefined
  participant: string|undefined
  participant_patient: string|undefined
  participant_practitioner: string|undefined
  participant_location: string|undefined
  minutes_duration: string|undefined
  reason: string|undefined
  cancelation_reason: string|undefined
  service_category: string|undefined

  constructor(fhirResource: any, fhirVersion?: fhirVersions, fastenOptions?: FastenOptions) {
    super(fastenOptions)
    this.source_resource_type = ResourceType.Appointment
    this.resourceDTO(fhirResource, fhirVersion || fhirVersions.R4);
  }


  commonDTO(fhirResource:any) {
    this.code = _.get(fhirResource, 'serviceType.0') || _.get(fhirResource, 'reasonCode.0');
    this.description = _.get(fhirResource, 'description');
    this.status = _.get(fhirResource, 'status');
    this.start = _.get(fhirResource, 'start');
    this.type_coding = _.get(fhirResource, 'type.coding');
    this.comment = _.get(fhirResource, 'comment');
    this.participant = _.get(fhirResource, 'participant');
    // const {
    //   participantPatient,
    //   participantPractitioner,
    //   participantLocation,
    // } = prepareParticipantData(participant);
    this.minutes_duration = _.get(fhirResource, 'minutesDuration');
    this.reason = _.get(fhirResource, 'reason', []);
  };

  stu3DTO(fhirResource:any) {
    this.service_category = _.get(fhirResource, 'serviceCategory', []);
    this.type_coding = _.get(fhirResource, 'appointmentType.coding');
  };

  r4DTO(fhirResource:any) {
    this.reason = _.get(fhirResource, 'reasonCode', []);
    this.cancelation_reason = _.get(fhirResource, 'cancelationReason', []);
    this.service_category = _.get(fhirResource, 'serviceCategory', []);
    this.type_coding = _.get(fhirResource, 'appointmentType.coding');
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
