import { Component, OnInit } from '@angular/core';
import {ResourceFhir} from '../../models/fasten/resource_fhir';
import {FastenApiService} from '../../services/fasten-api.service';

@Component({
  selector: 'app-patient-profile',
  templateUrl: './patient-profile.component.html',
  styleUrls: ['./patient-profile.component.scss']
})
export class PatientProfileComponent implements OnInit {

  patient: ResourceFhir = null
  immunizations: ResourceFhir[] = []
  allergyIntolerances: ResourceFhir[] = []
  constructor(
    private fastenApi: FastenApiService,
  ) { }

  ngOnInit(): void {
    this.fastenApi.getResources("Patient").subscribe(results => {
      console.log(results)
      this.patient = results[0]
    })

    this.fastenApi.getResources("Immunization").subscribe(results => {
      console.log(results)
      this.immunizations = results
    })

    this.fastenApi.getResources("AllergyIntolerance").subscribe(results => {
      console.log(results)
      this.allergyIntolerances = results
    })
  }

}
