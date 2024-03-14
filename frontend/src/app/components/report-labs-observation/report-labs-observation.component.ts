import { Component, Input, OnInit } from '@angular/core';
import { ResourceFhir } from '../../models/fasten/resource_fhir';
import { ObservationModel } from 'src/lib/models/resources/observation-model';

@Component({
  selector: 'app-report-labs-observation',
  templateUrl: './report-labs-observation.component.html',
  styleUrls: ['./report-labs-observation.component.scss']
})
export class ReportLabsObservationComponent implements OnInit {
  @Input() observations: ResourceFhir[] = []
  @Input() observationCode: string
  @Input() observationTitle: string

  observationModels: ObservationModel[] = []
  firstObservation: ResourceFhir = null

  constructor() { }

  ngOnInit(): void {
    //sort observations
    this.observations = this.observations?.sort((a, b) => a.sort_date > b.sort_date ? -1 : a.sort_date < b.sort_date ? 1 : 0)

    if(this.observations.length > 0){
      this.firstObservation = this.observations[0]
    }

    this.observationModels = this.observations.map(ob => new ObservationModel(ob.resource_raw))
  }
}
