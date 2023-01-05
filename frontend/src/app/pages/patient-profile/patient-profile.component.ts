import { Component, OnInit } from '@angular/core';
import {ResourceFhir} from '../../models/fasten/resource_fhir';
import {FastenApiService} from '../../services/fasten-api.service';
import {forkJoin} from 'rxjs';

@Component({
  selector: 'app-patient-profile',
  templateUrl: './patient-profile.component.html',
  styleUrls: ['./patient-profile.component.scss']
})
export class PatientProfileComponent implements OnInit {
  loading: boolean = false

  patient: ResourceFhir = null
  immunizations: ResourceFhir[] = []
  allergyIntolerances: ResourceFhir[] = []
  constructor(
    private fastenApi: FastenApiService,
  ) { }

  ngOnInit(): void {
    this.loading = true

    forkJoin([
      this.fastenApi.getResources("Patient"),
      this.fastenApi.getResources("Immunization"),
      this.fastenApi.getResources("AllergyIntolerance")
    ]).subscribe(results => {
      this.loading = false
      console.log(results)
      this.patient = results[0][0]
      this.immunizations = results[1]
      this.allergyIntolerances = results[2]
    }, error => {
      this.loading = false
    })
  }

}
