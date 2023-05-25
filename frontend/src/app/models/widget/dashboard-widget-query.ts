export class DashboardWidgetQuery {
  use?: string
  select: string[]
  from: string
  where: string[]
  // limit: number
  // offset: number

  //https://lodash.com/docs/4.17.15#unionBy
  aggregation_params?: string[]
  aggregation_type?: 'countBy' | 'unionBy' | 'groupBy' | 'orderBy' | 'sortBy' | 'minBy' | 'maxBy' | 'sumBy'
}
