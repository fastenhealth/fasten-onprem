import { Component, OnInit } from '@angular/core';
import {ChartsModule} from 'ng2-charts';

@Component({
  standalone: true,
  imports: [ChartsModule],
  selector: 'app-patient-vitals-widget',
  templateUrl: './patient-vitals-widget.component.html',
  styleUrls: ['./patient-vitals-widget.component.scss']
})
export class PatientVitalsWidgetComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
