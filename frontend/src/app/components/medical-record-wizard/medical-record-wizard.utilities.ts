import {
  MedicalRecordWizardFormCreate,
  ResourceCreateCondition, ResourceCreateAttachment, ResourceCreateMedication,
  ResourceCreateOrganization, ResourceCreatePractitioner,
  ResourceCreateProcedure
} from '../../models/fasten/resource_create';
import {
  Condition,
  Medication,
  Procedure,
  Location as FhirLocation,
  BundleEntry,
  Resource,
  Bundle,
  Organization,
  Practitioner, MedicationRequest, Patient, Encounter, DocumentReference, Media, DiagnosticReport, Reference, Binary, HumanName, Observation
} from 'fhir/r4';
import { uuidV4 } from '../../../lib/utils/uuid';
import { OrganizationModel } from '../../../lib/models/resources/organization-model';
import { PractitionerModel } from '../../../lib/models/resources/practitioner-model';
import { EncounterModel } from '../../../lib/models/resources/encounter-model';
import { ReferenceModel } from '../../../lib/models/datatypes/reference-model';
import { FastenDisplayModel } from '../../../lib/models/fasten/fasten-display-model';
import { generateReferenceUriFromResourceOrReference } from '../../../lib/utils/bundle_references';
import { HumanNameModel } from '../../../lib/models/datatypes/human-name-model';
import { MedicationModel, ProcedureModel } from 'src/lib/public-api';
import { MedicationRequestModel } from 'src/lib/models/resources/medication-request-model';

export interface WizardFhirResourceWrapper<T extends OrganizationModel | PractitionerModel | EncounterModel | Bundle> {
  data: T,
  action: 'find'|'create'
}

interface ResourceStorage {
  [resourceType: string]: {
    [resourceId: string]: Condition | Patient | MedicationRequest | Organization | FhirLocation | Practitioner | Procedure | Encounter | DocumentReference | Media | DiagnosticReport | Binary | Observation | Reference
  }
}

export function GenerateR4ResourceLookup(resourceCreate: MedicalRecordWizardFormCreate): ResourceStorage {
  let resourceStorage: ResourceStorage = {}
  // resourceStorage = placeholderR4Patient(resourceStorage)
  // resourceStorage = resourceCreateConditionToR4Condition(resourceStorage, resourceCreate.condition)

  resourceStorage = resourceCreateEncounterToR4Encounter(resourceStorage, resourceCreate.encounter)

  for (let attachment of resourceCreate.attachments) {
    if (attachment.file_type == 'application/dicom' ||
      attachment.category.id == '18726-0' || //Radiology studies (set)
      attachment.category.id == '27897-8' || //	Neuromuscular electrophysiology studies (set)
      attachment.category.id == '18748-4' // 	Diagnostic imaging study
    ) {
      //Diagnostic imaging study (DiagnosticReport -> Media)
      resourceStorage = resourceAttachmentToR4DiagnosticReport(resourceStorage, attachment)
    }
    else {
      resourceStorage = resourceAttachmentToR4DocumentReference(resourceStorage, attachment)
    }
  }

  for (let organization of resourceCreate.organizations) {
    resourceStorage = resourceCreateOrganizationToR4Organization(resourceStorage, organization)
  }
  for (let practitioner of resourceCreate.practitioners) {
    resourceStorage = resourceCreatePractitionerToR4Practitioner(resourceStorage, practitioner)
  }
  for (let medication of resourceCreate.medications) {
    resourceStorage = resourceCreateMedicationToR4MedicationRequest(resourceStorage, medication)
  }
  for (let procedure of resourceCreate.procedures) {
    resourceStorage = resourceCreateProcedureToR4Procedure(resourceStorage, procedure)
  }


  //DocumentReference  -> (Optional) Binary
  //DiagnosticReport -> Media
  for (let labresult of resourceCreate.labresults) {
    resourceStorage = resourceCreateLabResultsToR4DiagnosticReports(resourceStorage, labresult)
  }
  //ImagingStudy
  //ImagingSelection



  return resourceStorage
}

//Private methods

// this model is based on FHIR401 Resource Encounter - http://hl7.org/fhir/R4/encounter.html
function resourceCreateEncounterToR4Encounter(resourceStorage: ResourceStorage, resourceEncounter: WizardFhirResourceWrapper<EncounterModel>): ResourceStorage {
  resourceStorage['Encounter'] = resourceStorage['Encounter'] || {}
  console.warn("resourceEncounter", resourceEncounter)

  if (resourceEncounter.action == 'create') {
    let createdResourceEncounter = {
      resourceType: 'Encounter',
      id: resourceEncounter.data.source_resource_id,
      serviceType: resourceEncounter.data.code,
      status: "finished",
      // participant: [
      //   {
      //     individual: {
      //       reference: `urn:uuid:${resourceCreateProcedure.performer}` //Practitioner
      //     }
      //   }
      // ],
      participant: [],
      period: {
        start: resourceEncounter.data.period_start,
        end: resourceEncounter.data.period_end,
      },
      reasonReference: [],
      serviceProvider: {
        // reference: `urn:uuid:${resourceCreateProcedure.location}` //Organization
      }
    } as Encounter
    resourceStorage['Encounter'][createdResourceEncounter.id] = createdResourceEncounter
  } else {
    let foundResourceEncounter = {
      type: 'Encounter',
      reference: generateReferenceUriFromResourceOrReference(resourceEncounter.data),
    }
    resourceStorage['Encounter'][foundResourceEncounter.reference] = foundResourceEncounter
  }

  return resourceStorage
}



// this model is based on FHIR401 Resource Condition - http://hl7.org/fhir/R4/condition.html
// function resourceCreateConditionToR4Condition(resourceStorage: ResourceStorage, resourceCreateCondition: ResourceCreateCondition): ResourceStorage {
//   resourceStorage['Condition'] = resourceStorage['Condition'] || {}
//   resourceStorage['Encounter'] = resourceStorage['Encounter'] || {}
//
//   let note = []
//   if (resourceCreateCondition.description) {
//     note.push({
//       text: resourceCreateCondition.description,
//     })
//   }
//
//   let conditionResource = {
//     subject: {
//       reference: `urn:uuid:${findPatient(resourceStorage).id}` //Patient
//     },
//     resourceType: 'Condition',
//     id: uuidV4(),
//     code: {
//       coding: resourceCreateCondition.data.identifier || [],
//       text: resourceCreateCondition.data.identifier[0].display,
//     },
//     clinicalStatus: {
//       "coding": [
//         {
//           "system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
//           "code": resourceCreateCondition.status,
//         }
//       ]
//     },
//     onsetDateTime: `${new Date(resourceCreateCondition.started.year, resourceCreateCondition.started.month-1,resourceCreateCondition.started.day).toISOString()}`,
//     abatementDateTime: resourceCreateCondition.stopped ? `${new Date(resourceCreateCondition.stopped.year,resourceCreateCondition.stopped.month-1, resourceCreateCondition.stopped.day).toISOString()}` : null,
//     recordedDate: new Date().toISOString(),
//     note: note
//   } as Condition
//
//
//
//   resourceStorage['Condition'][conditionResource.id] = conditionResource
//   return resourceStorage
// }

// this model is based on FHIR401 Resource Procedure - http://hl7.org/fhir/R4/procedure.html
function resourceCreateProcedureToR4Procedure(resourceStorage: ResourceStorage, resourceCreateProcedure: ResourceCreateProcedure): ResourceStorage {
  resourceStorage['Procedure'] = resourceStorage['Procedure'] || {}

  let note = []
  if (resourceCreateProcedure.comment) {
    note.push({
      text: resourceCreateProcedure.comment,
    })
  }

  let encounterResource = findEncounter(resourceStorage) as Encounter | Reference
  let procedureResource = {
    status: "completed",
    resourceType: 'Procedure',
    id: uuidV4(),
    code: {
      coding: resourceCreateProcedure.data.identifier || [],
      text: resourceCreateProcedure.data.identifier?.[0]?.display,
    },
    performedDateTime: `${new Date(resourceCreateProcedure.whendone.year, resourceCreateProcedure.whendone.month - 1, resourceCreateProcedure.whendone.day).toISOString()}`,
    encounter: {
      reference: generateReferenceUriFromResourceOrReference(encounterResource) //Encounter
    },
    report: (resourceCreateProcedure.attachments || []).map(attachmentId => {
      return {
        reference: `urn:uuid:${attachmentId}` //DocumentReference or DiagnosticReport
      }
    }),
    performer: [
      {
        actor: {
          reference: resourceCreateProcedure.performer //Practitioner
        },
        onBehalfOf: {
          reference: resourceCreateProcedure.location //Organization
        }
      }
    ],
    note: note,
  } as Procedure
  resourceStorage['Procedure'][procedureResource.id] = procedureResource

  return resourceStorage
}

// this model is based on FHIR401 Resource Organization - http://hl7.org/fhir/R4/organization.html
function resourceCreateOrganizationToR4Organization(resourceStorage: ResourceStorage, resourceOrganization: WizardFhirResourceWrapper<OrganizationModel>): ResourceStorage {
  resourceStorage['Organization'] = resourceStorage['Organization'] || {}
  if (resourceOrganization.action == 'create') {
    let organizationResource = {
      resourceType: 'Organization',
      id: resourceOrganization.data.source_resource_id,
      name: resourceOrganization.data.name,
      identifier: resourceOrganization.data.identifier || [],
      type: resourceOrganization.data.type || [],
      address: resourceOrganization.data.addresses || [],
      telecom: resourceOrganization.data.telecom,
      active: true,
    } as Organization

    resourceStorage['Organization'][organizationResource.id] = organizationResource
  } else {
    let foundResourceOrganization = {
      type: 'Organization',
      reference: generateReferenceUriFromResourceOrReference(resourceOrganization.data),
    }
    resourceStorage['Organization'][foundResourceOrganization.reference] = foundResourceOrganization
  }

  return resourceStorage

}

// this model is based on FHIR401 Resource Practitioner - http://hl7.org/fhir/R4/practitioner.html
function resourceCreatePractitionerToR4Practitioner(resourceStorage: ResourceStorage, resourcePractitioner: WizardFhirResourceWrapper<PractitionerModel>): ResourceStorage {
  resourceStorage['Practitioner'] = resourceStorage['Practitioner'] || {}
  if (resourcePractitioner.action == 'create') {

    let humanName = [] as HumanName[]
    if (resourcePractitioner.data.name) {
      humanName = resourcePractitioner.data.name.map((name: HumanNameModel) => {
        return {
          family: name.familyName,
          given: name.givenName.split(', '),
          suffix: name.suffix.split(', '),
          text: name.displayName,
          use: 'official',
        }
      })
    }

    let practitionerResource = {
      resourceType: 'Practitioner',
      id: resourcePractitioner.data.source_resource_id,
      name: humanName,
      identifier: resourcePractitioner.data.identifier || [],
      address: resourcePractitioner.data.address || [],
      telecom: resourcePractitioner.data.telecom || [],
      active: true,
    } as Practitioner

    if (resourcePractitioner.data.qualification) {
      practitionerResource.qualification = [{
        code: {
          coding: resourcePractitioner.data.qualification || []
        },
      }]
    }

    resourceStorage['Practitioner'][practitionerResource.id] = practitionerResource
  } else {
    let foundResourcePractitioner = {
      type: 'Practitioner',
      reference: generateReferenceUriFromResourceOrReference(resourcePractitioner.data),
    }
    resourceStorage['Practitioner'][foundResourcePractitioner.reference] = foundResourcePractitioner
  }
  return resourceStorage
}

// this model is based on FHIR401 Resource Medication - https://www.hl7.org/fhir/R4/MedicationRequest.html
function resourceCreateMedicationToR4MedicationRequest(resourceStorage: ResourceStorage, resourceCreateMedication: ResourceCreateMedication): ResourceStorage {
  resourceStorage['MedicationRequest'] = resourceStorage['MedicationRequest'] || {}

  let encounterResource = findEncounter(resourceStorage) as Encounter | Reference

  let medicationRequestResource = {
    id: uuidV4(),
    resourceType: 'MedicationRequest',
    status: resourceCreateMedication.status,
    statusReason: {
      coding: resourceCreateMedication.whystopped?.identifier || [],
    },
    intent: 'order',
    medicationCodeableConcept: {
      coding: resourceCreateMedication.data.identifier || [],
    },
    encounter: {
      reference: generateReferenceUriFromResourceOrReference(encounterResource) //Encounter
    },
    authoredOn: `${new Date(resourceCreateMedication.started.year, resourceCreateMedication.started.month - 1, resourceCreateMedication.started.day).toISOString()}`,
    requester: {
      reference: resourceCreateMedication.requester // Practitioner
    },
    supportingInformation: (resourceCreateMedication.attachments || []).map((attachmentId) => {
      return {
        reference: `urn:uuid:${attachmentId}` //DocumentReference or DiagnosticReport
      }
    }),
    note: [
      {
        text: resourceCreateMedication.instructions,
      }
    ],
    dispenseRequest: {
      validityPeriod: {
        start: `${new Date(resourceCreateMedication.started.year, resourceCreateMedication.started.month - 1, resourceCreateMedication.started.day).toISOString()}`,
        end: resourceCreateMedication.stopped ? `${new Date(resourceCreateMedication.stopped.year, resourceCreateMedication.stopped.month - 1, resourceCreateMedication.stopped.day).toISOString()}` : null,
      },
    },
  } as MedicationRequest
  resourceStorage['MedicationRequest'][medicationRequestResource.id] = medicationRequestResource

  return resourceStorage
}

function resourceAttachmentToR4DocumentReference(resourceStorage: ResourceStorage, resourceAttachment: ResourceCreateAttachment): ResourceStorage {
  let encounterResource = findEncounter(resourceStorage) as Encounter | Reference

  resourceStorage['Binary'] = resourceStorage['Binary'] || {}
  let binaryResource = {
    id: uuidV4(),
    resourceType: 'Binary',
    contentType: resourceAttachment.file_type,
    data: resourceAttachment.file_content,
  } as Binary
  resourceStorage['Binary'][binaryResource.id] = binaryResource

  resourceStorage['DocumentReference'] = resourceStorage['DocumentReference'] || {}

  let documentReferenceResource = {
    id: resourceAttachment.id,
    resourceType: 'DocumentReference',
    status: 'current',
    category: [
      {
        coding: resourceAttachment.category.identifier || [],
        text: resourceAttachment.category.text,
      }
    ],
    // description: resourceAttachment.description,
    content: [
      {
        attachment: {
          contentType: resourceAttachment.file_type,
          url: `urn:uuid:${binaryResource.id}`, //Binary
          title: resourceAttachment.name,
        }
      }
    ],
    context: {
      encounter: [{
        reference: generateReferenceUriFromResourceOrReference(encounterResource) //Encounter
      }],
    }

    // date: `${new Date(resourceDocumentReference.date.year,resourceDocumentReference.date.month-1,resourceDocumentReference.date.day).toISOString()}`,
  } as DocumentReference
  resourceStorage['DocumentReference'][documentReferenceResource.id] = documentReferenceResource

  return resourceStorage
}

function resourceAttachmentToR4DiagnosticReport(resourceStorage: ResourceStorage, resourceAttachment: ResourceCreateAttachment): ResourceStorage {
  let encounterResource = findEncounter(resourceStorage) as Encounter | Reference

  resourceStorage['Binary'] = resourceStorage['Binary'] || {}
  let binaryResource = {
    id: uuidV4(),
    resourceType: 'Binary',
    contentType: resourceAttachment.file_type,
    data: resourceAttachment.file_content,
  } as Binary
  resourceStorage['Binary'][binaryResource.id] = binaryResource

  resourceStorage['Media'] = resourceStorage['Media'] || {}

  let mediaResource = {
    id: uuidV4(),
    resourceType: 'Media',
    status: 'completed',
    type: {
      coding: resourceAttachment.category.identifier || [],
      display: resourceAttachment.category.text,
    },
    content: {
      contentType: resourceAttachment.file_type,
      url: `urn:uuid:${binaryResource.id}`, //Binary,
      title: resourceAttachment.name,
    },
  } as Media
  resourceStorage['Media'][mediaResource.id] = mediaResource

  resourceStorage['DiagnosticReport'] = resourceStorage['DiagnosticReport'] || {}
  let diagnosticReportResource = {
    id: resourceAttachment.id,
    resourceType: 'DiagnosticReport',
    status: 'final',
    code: {
      coding: resourceAttachment.category.identifier || [],
    },
    encounter: {
      reference: generateReferenceUriFromResourceOrReference(encounterResource) //Encounter
    },
    media: [
      {
        link: {
          reference: `urn:uuid:${mediaResource.id}` //Media
        }
      },
    ],
  } as DiagnosticReport
  resourceStorage['DiagnosticReport'][diagnosticReportResource.id] = diagnosticReportResource

  return resourceStorage
}

function resourceCreateLabResultsToR4DiagnosticReports(resourceStorage: ResourceStorage, resourceLabResult: WizardFhirResourceWrapper<Bundle>): ResourceStorage {
  resourceLabResult.data.entry.forEach((entry) => {

    if (entry.resource.resourceType === 'Observation') {
      resourceStorage['Observation'] = resourceStorage['Observation'] || {}
      let resource = entry.resource as Observation
      resourceStorage['Observation'][resource.id] = resource
    } else if (entry.resource.resourceType === 'DiagnosticReport') {
      resourceStorage['DiagnosticReport'] = resourceStorage['DiagnosticReport'] || {}
      let resource = entry.resource as DiagnosticReport
      resourceStorage['DiagnosticReport'][resource.id] = resource
    } else {
      console.log('Unknown resource type: ', entry.resource.resourceType)
    }
  })
  return resourceStorage
}


function findEncounter(resourceStorage: ResourceStorage): Encounter | Reference {
  let [encounterId] = Object.keys(resourceStorage['Encounter'])
  return resourceStorage['Encounter'][encounterId] as Encounter | Reference
}

export function EncounterToR4Encounter(encounter: EncounterModel): Encounter {
  return {
    resourceType: 'Encounter',
    id: encounter.source_resource_id,
    serviceType: encounter.code,
    status: "finished",
    // participant: [
    //   {
    //     individual: {
    //       reference: `urn:uuid:${resourceCreateProcedure.performer}` //Practitioner
    //     }
    //   }
    // ],
    participant: [],
    period: {
      start: encounter.period_start,
      end: encounter.period_end,
    },
    reasonReference: [],
    serviceProvider: {
      // reference: `urn:uuid:${resourceCreateProcedure.location}` //Organization
    }
  } as Encounter
}

export function PractitionerToR4Practitioner(practitioner: PractitionerModel): Practitioner {
  let humanName = [] as HumanName[]
  if (practitioner.name) {
    humanName = practitioner.name.map((name: HumanNameModel) => {
      return {
        family: name.familyName,
        given: name.givenName.split(', '),
        suffix: name.suffix.split(', '),
        text: name.displayName,
        use: 'official',
      }
    })
  }

  let practitionerResource = {
    resourceType: 'Practitioner',
    id: practitioner.source_resource_id,
    name: humanName,
    identifier: practitioner.identifier || [],
    address: practitioner.address || [],
    telecom: practitioner.telecom || [],
    active: true,
  } as Practitioner

  if (practitioner.qualification) {
    practitionerResource.qualification = [{
      code: {
        coding: practitioner.qualification || []
      },
    }]
  }

  return practitionerResource
}

export function OrganizationToR4Organization(organization: OrganizationModel): Organization {
  return {
    resourceType: 'Organization',
    id: organization.source_resource_id,
    name: organization.name,
    identifier: organization.identifier || [],
    type: organization.type || [],
    address: organization.addresses || [],
    telecom: organization.telecom,
    active: true,
  } as Organization
}

export function UpdateProcedureToR4Procedure(updateProcedure: ProcedureModel): Procedure {
  return {
    status: updateProcedure.status,
    code: updateProcedure.code,
    performedDateTime: updateProcedure.performed_datetime,
    performer: updateProcedure.performer,
    note: updateProcedure.note,
  } as Procedure
}

export function UpdateMedicationToR4Medication(updateMedication: MedicationModel): Medication {
  return {
    code: updateMedication.code,
  } as Medication
}

export function UpdateMedicationRequestToR4MedicationRequest(updateMedRequest: MedicationRequestModel, updateMedication: MedicationModel): MedicationRequest {
  return {
    status: updateMedRequest.status,
    authoredOn: updateMedRequest.created,
    requester: updateMedRequest.requester,
    dosageInstruction: updateMedRequest.dosage_instruction,
    medicationCodeableConcept: {
      coding: updateMedication.code.coding
    },
    medicationReference: {
      reference: `Medication/${updateMedication.source_resource_id}`
    }
  } as MedicationRequest
}