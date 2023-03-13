import {IResourceRaw} from './resource_fhir';
import {CodingModel} from '../../../lib/models/datatypes/coding-model';
import {NlmSearchResults} from '../../services/nlm-clinical-table-search.service';


//
// {
//   "condition": {
//   "data": {
//     "id": "14673",
//       "text": "Hepatitis C",
//       "link": "http://www.nlm.nih.gov/medlineplus/hepatitisc.html",
//       "identifier": {
//         "icd10": "R19.7"
//       }
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
//       "identifier": { "icd9": "" }
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
  condition: ResourceCreateCondition,
  "medications": ResourceCreateMedication[],
  "procedures": ResourceCreateProcedure[],
  "practitioners": ResourceCreatePractitioner[],
  "organizations": ResourceCreateOrganization[],
  "attachments": ResourceCreateAttachment[],
}

export interface ResourceCreateCondition {
  "data": NlmSearchResults,
  "status": "active" | "inactive",
  "started": ResourceCreateDate,
  "stopped": ResourceCreateDate,
  "description": string
}

export interface ResourceCreateDate {
  year: number
  month: number
  day: number
}

export interface ResourceCreateMedication {
  "data": NlmSearchResults,
  "status": "active" | "inactive",
  "dosage": {},
  "started": ResourceCreateDate,
  "stopped": ResourceCreateDate,
  "whystopped": NlmSearchResults
  "requester": string,
  "instructions": string
  "attachments": ResourceCreateAttachment[],
}

export interface ResourceCreateProcedure {
  "data": NlmSearchResults,
  "whendone": ResourceCreateDate,
  "comment": string,
  "performer": string,
  "location": string,
  "attachments": ResourceCreateAttachment[],
}

export interface ResourceCreatePractitioner {
  "id"?: string,
  "identifier": CodingModel[]
  "name": string,
  "profession": NlmSearchResults,
  "phone": string,
  "fax": string,
  "email": string,
  "address": Address,
}

export interface ResourceCreateOrganization {
  "id"?: string,
  "identifier": CodingModel[]
  "type": NlmSearchResults,
  "name": string,
  "phone": string,
  "fax": string,
  "email": string,
  "address": Address,
}

export interface ResourceCreateAttachment {
  "id"?: string,
  "identifier": CodingModel[]
  "name": string,
  "category": NlmSearchResults,
  "file_type": string,
  "file_name": string,
  "file_content": string,
  "file_size": number,
}


export interface Address {
  line1?: string
  line2?: string
  city?: string
  state?: string
  zip?: string
  country?: string
}
