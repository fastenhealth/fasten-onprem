import {Component, Input, OnInit} from '@angular/core';
import {ResourceFhir} from '../../models/fasten/resource_fhir';
import {FastenApiService} from '../../services/fasten-api.service';
import * as fhirpath from 'fhirpath';
import {PractitionerModel} from '../../../lib/models/resources/practitioner-model';

@Component({
  selector: 'report-header',
  templateUrl: './report-header.component.html',
  styleUrls: ['./report-header.component.scss']
})
export class ReportHeaderComponent implements OnInit {
  patient: ResourceFhir = null
  primaryCare: PractitionerModel = null
  @Input() reportHeaderTitle: string = ""
  @Input() reportHeaderSubTitle: string = "Organized by condition and encounters"

  constructor(
    private fastenApi: FastenApiService,
  ) { }

  ngOnInit(): void {
    this.fastenApi.getResources("Patient").subscribe(results => {
      this.patient = results[0]
      if(!this.patient) return

      let primaryCareId = fhirpath.evaluate(this.patient?.resource_raw, "Patient.generalPractitioner.reference.first()")
      if(primaryCareId){
        let primaryCareIdStr = primaryCareId.join("")
        let primaryCareIdParts = primaryCareIdStr.split("/")
        if(primaryCareIdParts.length == 2) {
          this.fastenApi.getResources(primaryCareIdParts[0], this.patient?.source_id,  primaryCareIdParts[1]).subscribe(primaryResults => {
            if (primaryResults.length > 0){
              this.primaryCare = new PractitionerModel(primaryResults[0].resource_raw)
            }
          })
        }
      }
    })
  }

}
