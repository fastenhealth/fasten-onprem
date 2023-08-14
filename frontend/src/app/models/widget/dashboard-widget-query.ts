export class DashboardWidgetQuery {
  use?: string
  select: string[]
  from: string
  where: {[key: string]: string | string[]}
  // limit: number
  // offset: number

  //https://lodash.com/docs/4.17.15#unionBy
  aggregations?: {
    count_by?: string, //alias for groupBy and orderBy
    group_by?: string,
    order_by?: string,
  }
  // aggregation_params?: string[]
  // aggregation_type?: 'countBy' | 'groupBy' | 'orderBy' // | 'minBy' | 'maxBy' | 'sumBy' // 'orderBy' | 'sortBy' |
}
