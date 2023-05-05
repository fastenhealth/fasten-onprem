import { NgModule } from '@angular/core';
import {ComplexLineWidgetComponent} from './complex-line-widget/complex-line-widget.component';
import {DashboardWidgetComponent} from './dashboard-widget/dashboard-widget.component';
import {DonutChartWidgetComponent} from './donut-chart-widget/donut-chart-widget.component';
import {DualGaugesWidgetComponent} from './dual-gauges-widget/dual-gauges-widget.component';
import {GroupedBarChartWidgetComponent} from './grouped-bar-chart-widget/grouped-bar-chart-widget.component';
import {PatientVitalsWidgetComponent} from './patient-vitals-widget/patient-vitals-widget.component';
import {SimpleLineChartWidgetComponent} from './simple-line-chart-widget/simple-line-chart-widget.component';
import {TableWidgetComponent} from './table-widget/table-widget.component';
@NgModule({
  imports: [

    //standalone components
    DashboardWidgetComponent,
    ComplexLineWidgetComponent,
    DonutChartWidgetComponent,
    DualGaugesWidgetComponent,
    GroupedBarChartWidgetComponent,
    PatientVitalsWidgetComponent,
    SimpleLineChartWidgetComponent,
    TableWidgetComponent,
  ],
  declarations: [],
  exports: [
    //standalone components
    DashboardWidgetComponent,
    ComplexLineWidgetComponent,
    DonutChartWidgetComponent,
    DualGaugesWidgetComponent,
    GroupedBarChartWidgetComponent,
    PatientVitalsWidgetComponent,
    SimpleLineChartWidgetComponent,
    TableWidgetComponent,
  ]
})

export class WidgetsModule { }
