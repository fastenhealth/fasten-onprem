import {DashboardWidgetConfig} from '../models/widget/dashboard-widget-config';

export interface DashboardWidgetComponentInterface {
  widgetConfig: DashboardWidgetConfig;
  loading: boolean;

  chartData: any;
  chartLabels: any;
  chartOptions: any;
  // chartColors: any;

  // markForCheck()
}
