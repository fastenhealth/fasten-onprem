import {getPath} from '../../fhir/utils';
import * as moment from 'moment'

export class Immunization {
  immunizationType: string
  status: string
  date: moment.Moment

  constructor(resourcePayload: any) {
    this.immunizationType = getPath(resourcePayload, "vaccineCode.coding.0.display")
    this.status = resourcePayload.status || "-"
    this.date = moment(resourcePayload.date || resourcePayload.occurrenceDateTime || resourcePayload.occurrenceString)
  }
}
