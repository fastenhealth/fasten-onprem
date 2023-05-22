import { Component, OnInit } from '@angular/core';
import {NgChartsModule} from 'ng2-charts';
import {DashboardWidgetComponent} from '../dashboard-widget/dashboard-widget.component';

@Component({
  standalone: true,
  imports: [NgChartsModule],
  selector: 'patient-vitals-widget',
  templateUrl: './patient-vitals-widget.component.html',
  styleUrls: ['./patient-vitals-widget.component.scss']
})
export class PatientVitalsWidgetComponent extends DashboardWidgetComponent implements OnInit {

  ngOnInit(): void {


  }

}
