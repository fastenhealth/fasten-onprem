export class DashboardWidgetQuery {
  use?: string
  select: string[]
  from: string
  where: {[key: string]: string | string[]}
  limit?: number
  offset?: number

  //https://lodash.com/docs/4.17.15#unionBy
  aggregations?: {
    count_by?: DashboardWidgetQueryAggregation, //alias for groupBy and orderBy
    group_by?: DashboardWidgetQueryAggregation,
    order_by?: DashboardWidgetQueryAggregation,
  }
  // aggregation_params?: string[]
  // aggregation_type?: 'countBy' | 'groupBy' | 'orderBy' // | 'minBy' | 'maxBy' | 'sumBy' // 'orderBy' | 'sortBy' |
}

export class DashboardWidgetQueryAggregation {
  field: string
  fn?: string
}
