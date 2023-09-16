import { Component, OnInit } from '@angular/core';
import {NgChartsModule} from 'ng2-charts';
import {CommonModule} from '@angular/common';
import {MomentModule} from 'ngx-moment';
import {LoadingWidgetComponent} from '../loading-widget/loading-widget.component';
import {EmptyWidgetComponent} from '../empty-widget/empty-widget.component';
import {DashboardWidgetComponent} from '../dashboard-widget/dashboard-widget.component';
import {DashboardWidgetConfig} from '../../models/widget/dashboard-widget-config';

@Component({
  standalone: true,
  imports: [CommonModule, LoadingWidgetComponent, EmptyWidgetComponent],
  selector: 'records-summary-widget',
  templateUrl: './records-summary-widget.component.html',
  styleUrls: ['./records-summary-widget.component.scss']
})
export class RecordsSummaryWidgetComponent extends DashboardWidgetComponent implements OnInit {

  // constructor() { }

  ngOnInit(): void {
    //manually define the widget config, rather than pull from the configuration file
    this.widgetConfig = {
      id: 'records-summary-widget',
      item_type: 'records-summary-widget',
      description_text: 'Displays a summary of patient records',
      width: 4,
      height: 5,
      title_text: 'Medical Records',
      queries: []

    } as DashboardWidgetConfig
    super.ngOnInit();
    this.loading = false
    this.isEmpty = false
  }

}
