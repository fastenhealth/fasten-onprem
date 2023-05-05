import { Component, OnInit } from '@angular/core';
import {ChartsModule} from 'ng2-charts';

@Component({
  standalone: true,
  imports: [ChartsModule],
  selector: 'app-dual-gauges-widget',
  templateUrl: './dual-gauges-widget.component.html',
  styleUrls: ['./dual-gauges-widget.component.scss']
})
export class DualGaugesWidgetComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }


  // Sessions by channel doughnut chart
  sessionsChartOneData = [{
    data: [40,60],
    backgroundColor: ['#007bff', '#cad0e8'],
    borderColor: ['#007bff', '#cad0e8'],
  }];

  sessionsChartOneLabels: ['Search', 'Email'];
  sessionsChartOneOptions = {
    cutoutPercentage: 78,
    maintainAspectRatio: false,
    responsive: true,
    legend: {
      display: false,
    },
    animation: {
      animateScale: true,
      animateRotate: true
    }
  };

  // Sessions by channel doughnut chart
  sessionsChartTwoData = [{
    data: [25,75],
    backgroundColor: ['#00cccc', '#cad0e8'],
    borderColor: ['#00cccc', '#cad0e8']
  }];

  sessionsChartTwoLabels: ['Search', 'Email'];
  sessionsChartTwoOptions = {
    cutoutPercentage: 78,
    maintainAspectRatio: false,
    responsive: true,
    legend: {
      display: false,
    },
    animation: {
      animateScale: true,
      animateRotate: true
    }
  };

}
