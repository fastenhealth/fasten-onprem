import * as moment from 'moment';
import {getPath} from '../../fhir/utils';

export class Observation {
  code: string
  status: string
  date: moment.Moment

// { title: 'Observation', versions: '*', format: 'code', getter: o => o.code.coding[0] },
// { title: 'Value', versions: '*', getter: o => obsValue(o) },
// { title: 'Effective', 'versions': '*', getter: o => attributeXTime(o,'effective') },
// { title: 'Issued Date', 'versions': '*', format: 'date', getter: o => o.issued },
// { title: 'ID', versions: '*', getter: o => o.id }

  constructor(resourcePayload: any) {
    this.code = getPath(resourcePayload, "code.coding[0].display")
    this.status = resourcePayload.status || "-"
    this.date = moment(resourcePayload.date || resourcePayload.occurrenceDateTime || resourcePayload.occurrenceString)
  }
}
