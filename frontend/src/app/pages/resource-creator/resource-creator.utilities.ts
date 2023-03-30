import {
  ResourceCreate,
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
  Bundle,
  Organization,
  Practitioner, MedicationRequest, Patient, Encounter, DocumentReference, Media, DiagnosticReport, Reference, Binary
} from 'fhir/r4';
import {uuidV4} from '../../../lib/utils/uuid';

interface ResourceStorage {
  [resourceType: string]: {
    [resourceId: string]: Condition | Patient | MedicationRequest | Organization | FhirLocation | Practitioner | Procedure | Encounter | DocumentReference | Media | DiagnosticReport | Binary
  }
}


export function GenerateR4Bundle(resourceCreate: ResourceCreate): Bundle {
  let resourceStorage: ResourceStorage = {} //{"resourceType": {"resourceId": resourceData}}
  resourceStorage = placeholderR4Patient(resourceStorage)
  resourceStorage = resourceCreateConditionToR4Condition(resourceStorage, resourceCreate.condition)

  for(let attachment of resourceCreate.attachments) {
    if(attachment.file_type == 'application/dicom' ||
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
  for(let organization of resourceCreate.organizations) {
    resourceStorage = resourceCreateOrganizationToR4Organization(resourceStorage, organization)
  }
  for(let practitioner of resourceCreate.practitioners) {
    resourceStorage = resourceCreatePractitionerToR4Practitioner(resourceStorage, practitioner)
  }
  for(let medication of resourceCreate.medications) {
    resourceStorage = resourceCreateMedicationToR4MedicationRequest(resourceStorage, medication)
  }
  for(let procedure of resourceCreate.procedures) {
    resourceStorage = resourceCreateProcedureToR4Procedure(resourceStorage, procedure)
  }


  //DocumentReference  -> (Optional) Binary
  //DiagnosticReport -> Media
  //ImagingStudy
  //ImagingSelection

  console.log("POPULATED RESOURCE STORAGE",  resourceStorage)

  let bundle = {
    resourceType: 'Bundle',
    type: 'transaction',
    entry: [],
  } as Bundle
  for(let resourceType in resourceStorage) {
    for(let resourceId in resourceStorage[resourceType]) {
      let resource = resourceStorage[resourceType][resourceId]
      bundle.entry.push({
        fullUrl: `urn:uuid:${resource.id}`,
        resource: resource,
      })
    }
  }

  return bundle
}

//Private methods

function placeholderR4Patient(resourceStorage: ResourceStorage): ResourceStorage {
  resourceStorage['Patient'] = resourceStorage['Patient'] || {}
  let patientResource = {
    resourceType: 'Patient',
    id: uuidV4(),
    name: [
      {
        family: 'Placeholder',
        given: ['Patient'],
      }
    ],
  } as Patient
  resourceStorage['Patient'][patientResource.id] = patientResource
  return resourceStorage
}

// this model is based on FHIR401 Resource Condition - http://hl7.org/fhir/R4/condition.html
function resourceCreateConditionToR4Condition(resourceStorage: ResourceStorage, resourceCreateCondition: ResourceCreateCondition): ResourceStorage {
  resourceStorage['Condition'] = resourceStorage['Condition'] || {}
  resourceStorage['Encounter'] = resourceStorage['Encounter'] || {}

  let note = []
  if (resourceCreateCondition.description) {
    note.push({
      text: resourceCreateCondition.description,
    })
  }

  let conditionResource = {
    subject: {
      reference: `urn:uuid:${findPatient(resourceStorage).id}` //Patient
    },
    resourceType: 'Condition',
    id: uuidV4(),
    code: {
      coding: resourceCreateCondition.data.identifier || [],
      text: resourceCreateCondition.data.identifier[0].display,
    },
    clinicalStatus: {
      "coding": [
        {
          "system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
          "code": resourceCreateCondition.status,
        }
      ]
    },
    onsetDateTime: `${new Date(resourceCreateCondition.started.year, resourceCreateCondition.started.month-1,resourceCreateCondition.started.day).toISOString()}`,
    abatementDateTime: resourceCreateCondition.stopped ? `${new Date(resourceCreateCondition.stopped.year,resourceCreateCondition.stopped.month-1, resourceCreateCondition.stopped.day).toISOString()}` : null,
    recordedDate: new Date().toISOString(),
    note: note
  } as Condition



  resourceStorage['Condition'][conditionResource.id] = conditionResource
  return resourceStorage
}

// this model is based on FHIR401 Resource Procedure - http://hl7.org/fhir/R4/procedure.html
function resourceCreateProcedureToR4Procedure(resourceStorage: ResourceStorage, resourceCreateProcedure: ResourceCreateProcedure): ResourceStorage {
  resourceStorage['Procedure'] = resourceStorage['Procedure'] || {}


  let note = []
  if (resourceCreateProcedure.comment) {
    note.push({
      text: resourceCreateProcedure.comment,
    })
  }

  let encounterResource = {
    resourceType: 'Encounter',
    id: uuidV4(),
    status: "finished",
    subject: {
      reference: `urn:uuid:${findPatient(resourceStorage).id}` //Patient
    },
    participant: [
      {
        individual: {
          reference: `urn:uuid:${resourceCreateProcedure.performer}` //Practitioner
        }
      }
    ],
    period: {
      start: `${new Date(resourceCreateProcedure.whendone.year, resourceCreateProcedure.whendone.month-1,resourceCreateProcedure.whendone.day).toISOString()}`,
      end: `${new Date(resourceCreateProcedure.whendone.year, resourceCreateProcedure.whendone.month-1,resourceCreateProcedure.whendone.day).toISOString()}`,
    },
    reasonReference: [
      {
        reference: `urn:uuid:${findCondition(resourceStorage).id}` //Condition
      }
    ],
    serviceProvider: {
      reference: `urn:uuid:${resourceCreateProcedure.location}` //Organization
    }
  } as Encounter
  resourceStorage['Encounter'][encounterResource.id] = encounterResource

  let procedureResource = {
    subject: {
      reference: `urn:uuid:${findPatient(resourceStorage).id}` //Patient
    },
    status: "completed",
    resourceType: 'Procedure',

    id: uuidV4(),
    code: {
      coding:  resourceCreateProcedure.data.identifier || [],
      text: resourceCreateProcedure.data.identifier[0].display,
    },
    performedDateTime: `${new Date(resourceCreateProcedure.whendone.year, resourceCreateProcedure.whendone.month-1,resourceCreateProcedure.whendone.day).toISOString()}`,
    encounter: {
      reference: `urn:uuid:${encounterResource.id}` //Encounter
    },
    reasonReference: [
      {
        reference: `urn:uuid:${findCondition(resourceStorage).id}` //Condition
      }
    ],
    report: (resourceCreateProcedure.attachments || []).map(attachmentId => {
      return {
        reference: `urn:uuid:${attachmentId}` //DocumentReference or DiagnosticReport
      }
    }),
    performer: [
      {
        actor: {
          reference: `urn:uuid:${resourceCreateProcedure.performer}` //Practitioner
        },
        onBehalfOf: {
          reference: `urn:uuid:${resourceCreateProcedure.location}` //Organization
        }
      }
    ],
    note: note,
  } as Procedure
  resourceStorage['Procedure'][procedureResource.id] = procedureResource

  return resourceStorage
}

// this model is based on FHIR401 Resource Organization - http://hl7.org/fhir/R4/organization.html
function resourceCreateOrganizationToR4Organization(resourceStorage: ResourceStorage, resourceCreateOrganization: ResourceCreateOrganization): ResourceStorage {
  resourceStorage['Organization'] = resourceStorage['Organization'] || {}

  let telecom = []
  if (resourceCreateOrganization.phone) {
    telecom.push({
      system: 'phone',
      value: resourceCreateOrganization.phone,
    })
  }
  if (resourceCreateOrganization.fax) {
    telecom.push({
      system: 'fax',
      value: resourceCreateOrganization.fax,
    })
  }
  if (resourceCreateOrganization.email) {
    telecom.push({
      system: 'email',
      value: resourceCreateOrganization.email,
    })
  }

  let organizationResource = {
    resourceType: 'Organization',
    id: resourceCreateOrganization.id,
    name: resourceCreateOrganization.name,
    identifier: resourceCreateOrganization.identifier || [],
    type: [
      {
        coding: resourceCreateOrganization.type.identifier || [],
      }
    ],
    address: [
      {
        line: [resourceCreateOrganization.address.line1, resourceCreateOrganization.address.line2],
        city: resourceCreateOrganization.address.city,
        state: resourceCreateOrganization.address.state,
        postalCode: resourceCreateOrganization.address.zip,
        country: resourceCreateOrganization.address.country,
      }
    ],
    telecom: telecom,
    active: true,
  } as Organization

  resourceStorage['Organization'][organizationResource.id] = organizationResource
  return resourceStorage

}

// this model is based on FHIR401 Resource Practitioner - http://hl7.org/fhir/R4/practitioner.html
function resourceCreatePractitionerToR4Practitioner(resourceStorage: ResourceStorage, resourceCreatePractitioner: ResourceCreatePractitioner): ResourceStorage {
  resourceStorage['Practitioner'] = resourceStorage['Practitioner'] || {}
  let telecom = []
  if (resourceCreatePractitioner.phone) {
    telecom.push({
      system: 'phone',
      value: resourceCreatePractitioner.phone,
    })
  }
  if (resourceCreatePractitioner.fax) {
    telecom.push({
      system: 'fax',
      value: resourceCreatePractitioner.fax,
    })
  }
  if (resourceCreatePractitioner.email) {
    telecom.push({
      system: 'email',
      value: resourceCreatePractitioner.email,
    })
  }
  let qualification = []
  if(resourceCreatePractitioner.profession){
    qualification.push({
      code: {
        coding: resourceCreatePractitioner.profession.identifier || [],
      }
    })
  }

  resourceCreatePractitioner.name.split(" ")

  let practitionerResource = {
    resourceType: 'Practitioner',
    id: resourceCreatePractitioner.id,
    name: [
      {
        text: resourceCreatePractitioner.name,
      },
    ],
    identifier: resourceCreatePractitioner.identifier || [],
    address: [
      {
        line: [resourceCreatePractitioner.address.line1, resourceCreatePractitioner.address.line2],
        city: resourceCreatePractitioner.address.city,
        state: resourceCreatePractitioner.address.state,
        postalCode: resourceCreatePractitioner.address.zip,
        country: resourceCreatePractitioner.address.country,
      }
    ],
    telecom: telecom,
    active: true,
    qualification: qualification
  } as Practitioner

  resourceStorage['Practitioner'][practitionerResource.id] = practitionerResource
  return resourceStorage
}

// this model is based on FHIR401 Resource Medication - https://www.hl7.org/fhir/R4/MedicationRequest.html
function resourceCreateMedicationToR4MedicationRequest(resourceStorage: ResourceStorage, resourceCreateMedication: ResourceCreateMedication): ResourceStorage {
  resourceStorage['MedicationRequest'] = resourceStorage['MedicationRequest'] || {}

  let encounterResource = {
    resourceType: 'Encounter',
    id: uuidV4(),
    status: "finished",
    subject: {
      reference: `urn:uuid:${findPatient(resourceStorage).id}` //Patient
    },
    participant: [
      {
        individual: {
          reference: `urn:uuid:${resourceCreateMedication.requester}` //Practitioner
        }
      }
    ],
    period: {
      start: `${new Date(resourceCreateMedication.started.year, resourceCreateMedication.started.month-1,resourceCreateMedication.started.day).toISOString()}`,
      end: resourceCreateMedication.stopped ? `${new Date(resourceCreateMedication.stopped.year, resourceCreateMedication.stopped.month-1,resourceCreateMedication.stopped.day).toISOString()}` : null,
    },
    reasonReference: [
      {
        reference: `urn:uuid:${findCondition(resourceStorage).id}` //Condition
      }
    ],
  } as Encounter
  resourceStorage['Encounter'][encounterResource.id] = encounterResource

  let medicationRequestResource = {
    id: uuidV4(),
    resourceType: 'MedicationRequest',
    status: resourceCreateMedication.status,
    statusReason: {
      coding: resourceCreateMedication.whystopped.identifier || [],
    },
    intent: 'order',
    medicationCodeableConcept: {
      coding: resourceCreateMedication.data.identifier || [],
    },
    subject:  {
      reference: `urn:uuid:${findPatient(resourceStorage).id}` //Patient
    },
    encounter: {
      reference: `urn:uuid:${encounterResource.id}` //Encounter
    },
    authoredOn: `${new Date(resourceCreateMedication.started.year,resourceCreateMedication.started.month-1,resourceCreateMedication.started.day).toISOString()}`,
    requester: {
      reference: `urn:uuid:${resourceCreateMedication.requester}` // Practitioner
    },
    supportingInformation: (resourceCreateMedication.attachments || []).map((attachmentId) => {
      return {
        reference: `urn:uuid:${attachmentId}` //DocumentReference or DiagnosticReport
      }
    }),
    reasonReference: [
      {
        reference: `urn:uuid:${findCondition(resourceStorage).id}` //Condition
      },
    ],
    note: [
      {
        text: resourceCreateMedication.instructions,
      }
    ],
    dispenseRequest: {
      validityPeriod: {
        start: `${new Date(resourceCreateMedication.started.year,resourceCreateMedication.started.month-1,resourceCreateMedication.started.day).toISOString()}`,
        end: resourceCreateMedication.stopped ? `${new Date(resourceCreateMedication.stopped.year,resourceCreateMedication.stopped.month-1,resourceCreateMedication.stopped.day).toISOString()}` : null,
      },
    },
  } as MedicationRequest
  resourceStorage['MedicationRequest'][medicationRequestResource.id] = medicationRequestResource

  return resourceStorage
}

function resourceAttachmentToR4DocumentReference(resourceStorage: ResourceStorage, resourceAttachment: ResourceCreateAttachment): ResourceStorage {
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
    subject: {
      reference: `urn:uuid:${findPatient(resourceStorage).id}` //Patient
    },
    content: [
      {
        attachment: {
          contentType: resourceAttachment.file_type,
          url: `urn:uuid:${binaryResource.id}`, //Binary
          title: resourceAttachment.name,
        }
      }
    ],
    context: [
      {
        related: [
          {
            reference: `urn:uuid:${findCondition(resourceStorage).id}` //Condition
          }
        ]
      }
    ]
    // date: `${new Date(resourceDocumentReference.date.year,resourceDocumentReference.date.month-1,resourceDocumentReference.date.day).toISOString()}`,
  } as DocumentReference
  resourceStorage['DocumentReference'][documentReferenceResource.id] = documentReferenceResource

  return resourceStorage
}

function resourceAttachmentToR4DiagnosticReport(resourceStorage: ResourceStorage, resourceAttachment: ResourceCreateAttachment): ResourceStorage {
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
    subject: {
      reference: `urn:uuid:${findPatient(resourceStorage).id}` //Patient
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
    subject: {
      reference: `urn:uuid:${findPatient(resourceStorage).id}` //Patient
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


function findCondition(resourceStorage: ResourceStorage): Condition {
  let [conditionId] = Object.keys(resourceStorage['Condition'])
  return resourceStorage['Condition'][conditionId] as Condition
}

function findPatient(resourceStorage: ResourceStorage): Patient {
  let [patientId] = Object.keys(resourceStorage['Patient'])
  return resourceStorage['Patient'][patientId] as Patient
}
