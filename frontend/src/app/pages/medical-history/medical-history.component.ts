import {Component, Input, OnInit} from '@angular/core';
import {FastenApiService} from '../../services/fasten-api.service';
import {ResourceFhir} from '../../models/fasten/resource_fhir';

@Component({
  selector: 'app-medical-history',
  templateUrl: './medical-history.component.html',
  styleUrls: ['./medical-history.component.scss']
})
export class MedicalHistoryComponent implements OnInit {

  conditions: ResourceFhir[] = []
  constructor(
    private fastenApi: FastenApiService,
  ) { }


  ngOnInit(): void {

    this.fastenApi.getResources("Condition").subscribe(results => {
      console.log(results)
      this.conditions = results
    })
  }



}
