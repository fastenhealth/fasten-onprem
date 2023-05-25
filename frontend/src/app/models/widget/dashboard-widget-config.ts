import {DashboardWidgetQuery} from './dashboard-widget-query';
import * as _ from 'lodash';

export class DashboardWidgetConfig {
  id: string
  item_type: "complex-line-widget" | "donut-chart-widget" | "dual-gauges-widget" | "grouped-bar-chart-widget" | "patient-vitals-widget" | "simple-line-chart-widget" | "table-widget"

  title_text: string
  description_text: string

  queries:  {
    q: DashboardWidgetQuery,
    conditional_formats?: [],
    dataset_options?: {
      label?: string,
      borderWidth?: number,
      borderColor?: string,
      fill?: boolean,
      backgroundColor?: string,
    }
    // type?: "line",
    // style?: {
    //   "palette": "grey" | "pastel" | "light" | "default"
    // }
  }[]


  //used for display purposes within the Dashboard, not for the actual chart
  // minWidth?: number
  // minHeight?: number
  width: number
  height: number
  x?: number
  y?: number

  parsing?: {label?: string, xAxisKey?: string, yAxisKey?: string} | {[name:string]: string}
}
