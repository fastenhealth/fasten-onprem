import * as moment from "moment"

export class Period {
  from: moment.Moment
  to: moment.Moment


  constructor(startDate?: string, endDate?: string) {
    this.from = startDate ? moment(startDate) : null
    this.to = endDate ? moment(endDate) : null
  }
}
