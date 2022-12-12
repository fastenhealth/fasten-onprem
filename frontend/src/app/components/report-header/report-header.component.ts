import {Component, Input, OnInit} from '@angular/core';
import {ResourceFhir} from '../../models/fasten/resource_fhir';
import {FastenApiService} from '../../services/fasten-api.service';
import * as fhirpath from 'fhirpath';

@Component({
  selector: 'report-header',
  templateUrl: './report-header.component.html',
  styleUrls: ['./report-header.component.scss']
})
export class ReportHeaderComponent implements OnInit {
  patient: ResourceFhir = null
  primaryCare: ResourceFhir = null
  @Input() reportHeaderTitle: string = ""
  @Input() reportHeaderSubTitle: string = "Organized by condition and encounters"

  constructor(
    private fastenApi: FastenApiService,
  ) { }

  ngOnInit(): void {
    this.fastenApi.getResources("Patient").subscribe(results => {
      console.log(results)
      this.patient = results[0]

      let primaryCareId = fhirpath.evaluate(this.patient.resource_raw, "Patient.generalPractitioner.reference.first()")
      console.log("GP:", primaryCareId)
      if(primaryCareId){
        let primaryCareIdStr = primaryCareId.join("")
        let primaryCareIdParts = primaryCareIdStr.split("/")
        if(primaryCareIdParts.length == 2) {
          console.log(primaryCareIdParts)
          this.fastenApi.getResources(primaryCareIdParts[0], this.patient.source_id,  primaryCareIdParts[1]).subscribe(primaryResults => {
            this.primaryCare = primaryResults[0]
          })
        }
      }
    })
  }

}
