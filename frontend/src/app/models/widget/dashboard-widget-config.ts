export class DashboardWidgetConfig {
  id: string
  item_type: "bar_chart" | "bubble_chart" | "doughnut_chart" | "line_chart" | "pie_chart" | "scatter_chart" | "calendar" | "striped_table" | "basic_table"


  title_text: string
  description_text: string

  queries:  {
    q: string,
    "aggregator": "avg",
    "conditional_formats": [],
    "type": "line",
    "style": {
      "palette": "grey" | "pastel" | "light" | "default"
    }
  }[]


  //used for display purposes within the Dashboard, not for the actual chart
  minWidth?: number
  minHeight?: number
  width: number
  height: number
  x?: number
  y?: number
}
