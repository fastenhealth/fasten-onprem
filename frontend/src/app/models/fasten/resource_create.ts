import {IResourceRaw} from './resource_fhir';


//
// {
//   "condition": {
//   "data": {
//     "id": "14673",
//       "text": "Hepatitis C",
//       "link": "http://www.nlm.nih.gov/medlineplus/hepatitisc.html",
//       "icd10": "B19.20"
//   },
//   "status": "active",
//   "started": {
//     "year": 2023,
//       "month": 2,
//       "day": 23
//   },
//   "stopped": {
//     "year": 2023,
//       "month": 2,
//       "day": 24
//   },
//   "description": "hello world"
// },
//   "medications": [
//   {
//     "data": {
//       "id": "1171721",
//       "text": "DIOVAN (Oral Pill)"
//     },
//     "status": "active",
//     "dosage": {},
//     "started": {
//       "year": 2023,
//       "month": 2,
//       "day": 15
//     },
//     "stopped": {
//       "year": 2023,
//       "month": 2,
//       "day": 16
//     },
//     "whystopped": {
//       "id": "STP-4",
//       "text": "Replaced by better drug"
//     },
//     "resupply": {
//       "year": 2023,
//       "month": 2,
//       "day": 9
//     },
//     "instructions": "dfdsf"
//   }
// ],
//   "procedures": [
//   {
//     "data": {
//       "id": "5592",
//       "text": "Abscess drainage",
//       "link": "http://www.nlm.nih.gov/medlineplus/abscesses.html",
//       "icd9": ""
//     },
//     "whendone": {
//       "year": 2023,
//       "month": 2,
//       "day": 16
//     },
//     "comment": "dfsdf"
//   }
// ],
//   "practitioners": [
//   {
//     "contactType": "search",
//     "name": "",
//     "data": {
//       "id": "1689675621",
//       "text": "HAZEN, F.",
//       "provider_type": "Pharmacist",
//       "provider_address": "2562 MONROE BLVD, OGDEN, UT 84740",
//       "provider_fax": "(801) 399-1154",
//       "provider_phone": "(801) 399-1151"
//     },
//     "profession": {
//       "id": "CLIN",
//       "text": "Clinical psychologist"
//     },
//     "phone": "",
//     "fax": "",
//     "email": "",
//     "comment": "df"
//   }
// ],
//   "locations": [
//   {
//     "name": "",
//     "contactType": "search",
//     "data": {
//       "id": "1689935025",
//       "text": "D & D SPECIAL CARE",
//       "provider_type": "Assisted Living Facility",
//       "provider_address": "5760 NW 40TH TER, COCONUT CREEK, FL 33073",
//       "provider_fax": "",
//       "provider_phone": "(954) 675-3395"
//     },
//     "phone": "",
//     "fax": "",
//     "email": "",
//     "comment": "sfds"
//   },
// {
//   "name": "sdfsdf",
//   "contactType": "manual",
//   "data": {},
//   "phone": "sdfsdf",
//   "fax": "sdfsdf",
//   "email": "sdfsdf",
//   "comment": "sdfsdf"
// }
// ]
// }

export interface ResourceCreate {
  condition: {
    "data": ResourceCreateConditionData | string,
    "status": "active" | "inactive",
    "started": ResourceCreateDate,
    "stopped": ResourceCreateDate,
    "description": string
  },
  "medications": ResourceCreateMedication[],
  "procedures": ResourceCreateProcedure[],
  "practitioners": ResourceCreatePractitioner[],
  "locations": ResourceCreateLocation[]
}

export interface ResourceCreateConditionData {
  id: string
  text: string
  link: string
  icd10: string
}

export interface ResourceCreateDate {
  year: number
  month: number
  day: number
}

export interface ResourceCreateMedication {
  "data": ResourceCreateMedicationData | string,
  "status": "active" | "inactive",
  "dosage": {},
  "started": ResourceCreateDate,
  "stopped": ResourceCreateDate,
  "whystopped": {}
  "resupply": ResourceCreateDate,
  "instructions": string
}

export interface ResourceCreateMedicationData {
  id: string
  text: string
}

export interface ResourceCreateProcedure {
  "data": ResourceCreateProcedureData | string,
  "whendone": ResourceCreateDate,
  "comment": string
}
export interface ResourceCreateProcedureData {
  id: string
  text: string
  link: string
  icd9: string
}

export interface ResourceCreatePractitioner {
  "contactType": "search" | "manual"
  "name": string,
  "data": ResourceCreatePractitionerData | string,
  "profession": {},
  "phone": string,
  "fax": string,
  "email": string,
  "comment": string
}

export interface ResourceCreatePractitionerData {
  id: string
  text: string
  provider_type: string
  provider_address: string
  provider_fax: string
  provider_phone: string
}

export interface ResourceCreateLocation {
  "name": string,
  "contactType": "search" | "manual"
  "data": ResourceCreateLocationData | string,
  "phone": string,
  "fax": string,
  "email": string,
  "comment": string
}
export interface ResourceCreateLocationData {
  id: string
  text: string
  provider_type: string
  provider_address: string
  provider_fax: string
  provider_phone: string
}
