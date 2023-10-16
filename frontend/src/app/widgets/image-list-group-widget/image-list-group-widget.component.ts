import { Component, OnInit } from '@angular/core';
import {NgChartsModule} from 'ng2-charts';
import {CommonModule} from '@angular/common';
import {LoadingWidgetComponent} from '../loading-widget/loading-widget.component';
import {EmptyWidgetComponent} from '../empty-widget/empty-widget.component';
import {DashboardWidgetComponent} from '../dashboard-widget/dashboard-widget.component';
import {DashboardWidgetConfig} from '../../models/widget/dashboard-widget-config';

@Component({
  standalone: true,
  imports: [NgChartsModule, CommonModule, LoadingWidgetComponent, EmptyWidgetComponent],
  selector: 'image-list-group-widget',
  templateUrl: './image-list-group-widget.component.html',
  styleUrls: ['./image-list-group-widget.component.scss']
})
export class ImageListGroupWidgetComponent extends DashboardWidgetComponent implements OnInit {

  ngOnInit(): void {
    //manually define the widget config, rather than pull from the configuration file
    this.widgetConfig = {
      id: 'image-list-group-widget',
      item_type: 'image-list-group-widget',
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
