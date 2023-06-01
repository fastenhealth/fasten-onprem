import { Component, OnInit } from '@angular/core';
import {NgChartsModule} from 'ng2-charts';
import {DashboardWidgetComponent} from '../dashboard-widget/dashboard-widget.component';
import {CommonModule} from '@angular/common';
import {LoadingWidgetComponent} from '../loading-widget/loading-widget.component';
import {EmptyWidgetComponent} from '../empty-widget/empty-widget.component';

@Component({
  standalone: true,
  imports: [NgChartsModule, CommonModule, LoadingWidgetComponent, EmptyWidgetComponent],
  selector: 'table-widget',
  templateUrl: './table-widget.component.html',
  styleUrls: ['./table-widget.component.scss']
})
export class TableWidgetComponent  extends DashboardWidgetComponent implements OnInit {
  keys: string[] = []
  headers: string[] = []
  rows: any[] = []
  ngOnInit(): void {
    super.ngOnInit()
    this.chartDatasetsSubject.subscribe(this.processQueryResults.bind(this))
  }

  processQueryResults(queryResults: any[]) {
    if(!queryResults || queryResults.length < 1){
      return
    }

    let results = queryResults[0]

    for(let header in this.widgetConfig.parsing){
      this.headers.push(header)
      this.keys.push(this.widgetConfig.parsing[header])
    }

    let keys = this.keys
    this.rows = results.map((result: any) => {
      let row = []
      for(let key of keys){
        row.push(typeof (result?.[key]) === 'string' ? (result?.[key] || '') : ((result?.[key]?.[0]) || ''))
      }
      return row
    })

  }

}
