import {DashboardWidgetConfig} from '../models/widget/dashboard-widget-config';

export interface DashboardWidgetComponentInterface {
  widgetConfig: DashboardWidgetConfig;
  loading: boolean;

  chartDatasets: any;
  chartLabels: any;
  chartOptions: any;
  // chartColors: any;

  // markForCheck()
}
