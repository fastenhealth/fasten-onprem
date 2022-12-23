import { Component, OnInit } from '@angular/core';
import {FastenApiService} from '../../services/fasten-api.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ResourceFhir} from '../../models/fasten/resource_fhir';
import * as fhirpath from 'fhirpath';

@Component({
  selector: 'app-report-labs',
  templateUrl: './report-labs.component.html',
  styleUrls: ['./report-labs.component.scss']
})
export class ReportLabsComponent implements OnInit {

  observationGroups: {[key: string]: ResourceFhir[]} = {}
  observationGroupTitles: {[key: string]: string} = {}

  loading = true
  isEmptyReport = false

  constructor(
    private fastenApi: FastenApiService,
  ) { }

  ngOnInit(): void {
    this.fastenApi.getResources("Observation").subscribe(results => {
      this.loading = false
      results = results || []
      console.log("ALL OBSERVATIONS", results)

      //loop though all observations, group by "code.system": "http://loinc.org"
      for(let observation of results){
        let observationGroup = fhirpath.evaluate(observation.resource_raw, "Observation.code.coding.where(system='http://loinc.org').first().code")[0]
        this.observationGroups[observationGroup] = this.observationGroups[observationGroup] ? this.observationGroups[observationGroup] : []
        this.observationGroups[observationGroup].push(observation)

        if(!this.observationGroupTitles[observationGroup]){
          this.observationGroupTitles[observationGroup] = fhirpath.evaluate(observation.resource_raw, "Observation.code.coding.where(system='http://loinc.org').first().display")[0]
        }
      }

      this.isEmptyReport = !!!results.length
    }, error => {
      this.loading = false
      this.isEmptyReport = true
    })
  }




  isEmpty(obj: any) {
    return Object.keys(obj).length === 0;
  }


}
