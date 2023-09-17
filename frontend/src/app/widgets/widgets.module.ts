import {Component, NgModule, Type} from '@angular/core';
import {ComplexLineWidgetComponent} from './complex-line-widget/complex-line-widget.component';
import {DonutChartWidgetComponent} from './donut-chart-widget/donut-chart-widget.component';
import {DualGaugesWidgetComponent} from './dual-gauges-widget/dual-gauges-widget.component';
import {GroupedBarChartWidgetComponent} from './grouped-bar-chart-widget/grouped-bar-chart-widget.component';
import {PatientVitalsWidgetComponent} from './patient-vitals-widget/patient-vitals-widget.component';
import {SimpleLineChartWidgetComponent} from './simple-line-chart-widget/simple-line-chart-widget.component';
import {TableWidgetComponent} from './table-widget/table-widget.component';
import { LoadingWidgetComponent } from './loading-widget/loading-widget.component';
import { EmptyWidgetComponent } from './empty-widget/empty-widget.component';
import {DashboardWidgetComponent} from './dashboard-widget/dashboard-widget.component';
import { RecordsSummaryWidgetComponent } from './records-summary-widget/records-summary-widget.component';
import { ImageListGroupWidgetComponent } from './image-list-group-widget/image-list-group-widget.component';
@NgModule({
  imports: [

    //standalone components
    ComplexLineWidgetComponent,
    DonutChartWidgetComponent,
    DualGaugesWidgetComponent,
    GroupedBarChartWidgetComponent,
    PatientVitalsWidgetComponent,
    RecordsSummaryWidgetComponent,
    ImageListGroupWidgetComponent,
    SimpleLineChartWidgetComponent,
    TableWidgetComponent,
    LoadingWidgetComponent,
    EmptyWidgetComponent

  ],
  declarations: [],
  exports: [
    //standalone components
    ComplexLineWidgetComponent,
    DonutChartWidgetComponent,
    DualGaugesWidgetComponent,
    GroupedBarChartWidgetComponent,
    PatientVitalsWidgetComponent,
    RecordsSummaryWidgetComponent,
    ImageListGroupWidgetComponent,
    SimpleLineChartWidgetComponent,
    TableWidgetComponent,
    LoadingWidgetComponent,
    EmptyWidgetComponent

  ]
})

export class WidgetsModule { }

//when adding widgets to this list, you must also register the widget id in
// frontend/src/app/models/widget/dashboard-widget-config.ts
export function WidgetComponents():  Type<Object>[] {
  return [
    ComplexLineWidgetComponent,
    DonutChartWidgetComponent,
    DualGaugesWidgetComponent,
    GroupedBarChartWidgetComponent,
    PatientVitalsWidgetComponent,
    RecordsSummaryWidgetComponent,
    ImageListGroupWidgetComponent,
    SimpleLineChartWidgetComponent,
    TableWidgetComponent,
    LoadingWidgetComponent,
    EmptyWidgetComponent
  ]
}
