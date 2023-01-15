import { Component, OnInit } from '@angular/core';
import {ResourceFhir} from '../../models/fasten/resource_fhir';
import {FastenApiService} from '../../services/fasten-api.service';
import {forkJoin} from 'rxjs';
import {fhirModelFactory} from '../../../lib/models/factory';
import {ResourceType} from '../../../lib/models/constants';
import {ImmunizationModel} from '../../../lib/models/resources/immunization-model';
import {AllergyIntoleranceModel} from '../../../lib/models/resources/allergy-intolerance-model';

@Component({
  selector: 'app-patient-profile',
  templateUrl: './patient-profile.component.html',
  styleUrls: ['./patient-profile.component.scss']
})
export class PatientProfileComponent implements OnInit {
  loading: boolean = false

  patient: ResourceFhir = null
  immunizations: ImmunizationModel[] = []
  allergyIntolerances: AllergyIntoleranceModel[] = []
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
      this.immunizations = results[1].map((immunization) => {
        return fhirModelFactory(immunization.source_resource_type as ResourceType, immunization) as ImmunizationModel
      })
      this.allergyIntolerances = results[2].map((allergy) => {
        return fhirModelFactory(allergy.source_resource_type as ResourceType, allergy) as AllergyIntoleranceModel
      })
    }, error => {
      this.loading = false
    })
  }

}
