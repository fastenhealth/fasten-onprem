import {Component, Input, OnInit} from '@angular/core';
import {ResourceFhir} from '../../models/fasten/resource_fhir';

@Component({
  selector: 'app-report-labs-observation',
  templateUrl: './report-labs-observation.component.html',
  styleUrls: ['./report-labs-observation.component.scss']
})
export class ReportLabsObservationComponent implements OnInit {

  @Input() observations: ResourceFhir[]
  @Input() observationCode: string
  @Input() observationTitle: string


  constructor() { }

  ngOnInit(): void {
  }

}
