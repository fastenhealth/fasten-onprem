import {DashboardWidgetConfig} from './dashboard-widget-config';

export class DashboardConfig {
  id: string
  schema_version: string //increment this number when the config schema changes, not controlled by user.
  title: string
  description?: string
  source?: string //remote dashboard source (not present for default/embedded dashboards)

  widgets: DashboardWidgetConfig[]
}
