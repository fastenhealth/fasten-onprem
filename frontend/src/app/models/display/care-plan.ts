import {getPath} from '../../fhir/utils';

export class CarePlan {
  category: string
  reason: string[][]
  periodStart: string
  periodEnd: string
  status: string


  constructor(resourcePayload: any) {
    this.category = getPath(resourcePayload, "category.0.coding.0.display")
    this.reason = (resourcePayload.activity || []).map((a, i) => {
      let reason = getPath(a, "detail.code.coding.0.display") || ""
      return reason ? [reason, getPath(a, "detail.status") || "no data"] : []
    }).filter((arr) => {return arr.length > 0 })
    this.periodStart = resourcePayload.period.start
    this.periodEnd = resourcePayload.period.end
    this.status = resourcePayload.status
  }
}
