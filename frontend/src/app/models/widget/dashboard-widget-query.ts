export class DashboardWidgetQuery {
  use?: string
  select: string[]
  from: string
  where: {[key: string]: string | string[]}
  // limit: number
  // offset: number

  //https://lodash.com/docs/4.17.15#unionBy
  aggregation_params?: string[]
  aggregation_type?: 'countBy' | 'groupBy' // | 'minBy' | 'maxBy' | 'sumBy' // 'orderBy' | 'sortBy' |
}
