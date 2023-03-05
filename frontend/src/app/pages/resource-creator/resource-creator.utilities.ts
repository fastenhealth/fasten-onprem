import {
  ResourceCreate,
  ResourceCreateCondition, ResourceCreateMedication,
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
  Practitioner, MedicationRequest, Patient
} from 'fhir/r4';
import {uuidV4} from '../../../lib/utils/uuid';

interface ResourceStorage {
  [resourceType: string]: {
    [resourceId: string]: Condition | Patient | MedicationRequest | Organization | FhirLocation | Practitioner | Procedure
  }
}


export function GenerateR4Bundle(resourceCreate: ResourceCreate): Bundle {
  let resourceStorage: ResourceStorage = {} //{"resourceType": {"resourceId": resourceData}}
  resourceStorage = placeholderR4Patient(resourceStorage)
  resourceStorage = resourceCreateConditionToR4Condition(resourceStorage, resourceCreate.condition)
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

  let conditionCodes = []
  let conditionCode = {
    display: resourceCreateCondition.data.text,
  } as any
  if (resourceCreateCondition.data.identifier) {
    conditionCode.system = 'http://hl7.org/fhir/sid/icd-10'
    conditionCode.code = resourceCreateCondition.data.identifier?.icd10
  }
  conditionCodes.push(conditionCode)

  let note = []
  if (resourceCreateCondition.description) {
    note.push({
      text: resourceCreateCondition.description,
    })
  }

  let conditionResource = {
    subject: undefined,
    resourceType: 'Condition',
    id: uuidV4(),
    code: {
      coding: conditionCodes,
      text: conditionCodes[0].display,
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

  let procedureCodes = []
  let procedureCode = {
    display: resourceCreateProcedure.data.text,
  } as any
  if (resourceCreateProcedure.data.identifier) {
    procedureCode.system = 'http://hl7.org/fhir/sid/icd-9'
    procedureCode.code = resourceCreateProcedure.data.identifier?.icd9
  }
  procedureCodes.push(procedureCode)

  let note = []
  if (resourceCreateProcedure.comment) {
    note.push({
      text: resourceCreateProcedure.comment,
    })
  }

  let procedureResource = {
    subject: undefined,
    status: "completed",
    resourceType: 'Procedure',
    id: uuidV4(),
    code: {
      coding: procedureCodes,
      text: procedureCodes[0].display,
    },
    performedDateTime: `${new Date(resourceCreateProcedure.whendone.year, resourceCreateProcedure.whendone.month-1,resourceCreateProcedure.whendone.day).toISOString()}`,
    reasonReference: [
      {
        reference: `urn:uuid:${findCondition(resourceStorage).id}` //Condition
      }
    ],
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

  let identifier = []
  if (resourceCreateOrganization.identifier['npi']) {
    identifier.push({
      system: "http://hl7.org/fhir/sid/us-npi",
      value: resourceCreateOrganization.identifier['npi'],
      type: {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/v2-0203",
            code: "NPI"
          }
        ]
      }
    })
  }

  let organizationResource = {
    resourceType: 'Organization',
    id: resourceCreateOrganization.id,
    name: resourceCreateOrganization.name,
    identifier: identifier,
    type: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/organization-type',
            code: resourceCreateOrganization.type,
          }
        ]
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

  let identifier = []
  if (resourceCreatePractitioner.identifier['npi']) {
    identifier.push({
      system: "http://hl7.org/fhir/sid/us-npi",
      value: resourceCreatePractitioner.identifier['npi'],
      type: {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/v2-0203",
            code: "NPI"
          }
        ]
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
    identifier: identifier,
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
  } as Practitioner

  resourceStorage['Practitioner'][practitionerResource.id] = practitionerResource
  return resourceStorage
}

// this model is based on FHIR401 Resource Medication - http://hl7.org/fhir/R4/medication.html
function resourceCreateMedicationToR4MedicationRequest(resourceStorage: ResourceStorage, resourceCreateMedication: ResourceCreateMedication): ResourceStorage {
  resourceStorage['MedicationRequest'] = resourceStorage['MedicationRequest'] || {}

  let medicationRequestResource = {
    id: uuidV4(),
    resourceType: 'MedicationRequest',
    status: resourceCreateMedication.status,
    intent: 'order',
    medicationCodeableConcept: {
      coding: [
        {
          system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
          code: resourceCreateMedication.data.id,
          display: resourceCreateMedication.data.text,
        }
      ]
    },
    subject: null,
    authoredOn: `${new Date(resourceCreateMedication.started.year,resourceCreateMedication.started.month-1,resourceCreateMedication.started.day).toISOString()}`,
    requester: {
      reference: `urn:uuid:${resourceCreateMedication.requester}` // Practitioner
    },
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

function findCondition(resourceStorage: ResourceStorage): Condition {
  let [conditionId] = Object.keys(resourceStorage['Condition'])
  return resourceStorage['Condition'][conditionId] as Condition
}

function findPatient(resourceStorage: ResourceStorage): Patient {
  let [patientId] = Object.keys(resourceStorage['Patient'])
  return resourceStorage['Patient'][patientId] as Patient
}
