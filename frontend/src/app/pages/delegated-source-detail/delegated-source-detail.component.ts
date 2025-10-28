import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Source } from '../../models/fasten/source';
import { FastenApiService } from '../../services/fasten-api.service';
import { ResourceFhir } from '../../models/fasten/resource_fhir';
import { getPath } from '../../components/fhir-datatable/datatable-generic-resource/utils';

@Component({
  selector: 'app-delegated-source-detail',
  templateUrl: './delegated-source-detail.component.html',
  styleUrls: ['./delegated-source-detail.component.scss'],
})
export class DelegatedSourceDetailComponent implements OnInit {
  loading: boolean = false;

  selectedSource: Source = null;
  selectedPatient: ResourceFhir = null;
  selectedResourceType: string = null;
  selectedTotalElements: number = 0;

  resourceTypeCounts: { [name: string]: number } = {};

  constructor(
    private fastenApi: FastenApiService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    if (
      this.route.snapshot.paramMap.get('owner_user_id') &&
      this.route.snapshot.paramMap.get('source_id')
    ) {
      this.loading = true;

      //always request the source summary
      this.fastenApi
        .getDelegatedSourceSummary(
          this.route.snapshot.paramMap.get('owner_user_id'),
          this.route.snapshot.paramMap.get('source_id')
        )
        .subscribe(
          (sourceSummary) => {
            this.loading = false;
            this.selectedSource = sourceSummary.source;
            this.selectedPatient = sourceSummary.patient;
            for (let resourceTypeCount of sourceSummary.resource_type_counts) {
              this.resourceTypeCounts[resourceTypeCount.resource_type] =
                resourceTypeCount.count;
            }
          },
          (error) => {
            this.loading = false;
          }
        );
    }
  }

  selectResourceType(resourceType: string) {
    this.selectedResourceType = resourceType;
    this.selectedTotalElements = this.resourceTypeCounts[resourceType];
  }

  isExternal() {
    return (
      this.selectedSource?.brand_id != '00000000-0000-0000-0000-000000000000'
    );
  }

  //functions to call on patient
  getPatientName() {
    if (!this.selectedPatient) {
      return '';
    }

    const family = getPath(this.selectedPatient?.resource_raw, 'name.0.family') || '';

    // get the given name which may be a string or an array; normalize to array
    let given: unknown = getPath(this.selectedPatient?.resource_raw, 'name.0.given') || [];
    if (typeof given === 'string') {
      given = (given as string).split(/\s+/).filter(Boolean);
    }
    const givenArray = Array.isArray(given) ? given : [];

    return `${family}, ${givenArray.join(' ')}`;
  }

  getPatientGender() {
    return getPath(this.selectedPatient?.resource_raw, 'gender');
  }
  getPatientMRN() {
    return getPath(this.selectedPatient?.resource_raw, 'identifier.0.value');
  }
  getPatientEmail() {
    // @ts-ignore
    return (this.selectedPatient?.resource_raw?.telecom || []).filter(
      (telecom) => telecom.system === 'email'
    )[0]?.value;
  }
  getPatientDOB(): string | number {
    return getPath(this.selectedPatient?.resource_raw, 'birthDate');
  }
  getPatientAge() {
    // Can return NaN or a valid integer
    var msInYear = 365 * 24 * 60 * 60 * 1000;
    var patientDOB = this.getPatientDOB();
    if (patientDOB == null) {
      return NaN;
    }
    if (typeof patientDOB === 'string') {
      patientDOB = Date.parse(patientDOB);
    }
    var age = Date.now() - patientDOB;
    return Math.floor(age / msInYear);
  }
  getPatientPhone() {
    // @ts-ignore
    return (this.selectedPatient?.resource_raw?.telecom || []).filter(
      (telecom) => telecom.system === 'phone'
    )[0]?.value;
  }
  getPatientAddress() {
    const line = getPath(this.selectedPatient?.resource_raw, 'address.0.line');
    const city = getPath(this.selectedPatient?.resource_raw, 'address.0.city');
    const state = getPath(
      this.selectedPatient?.resource_raw,
      'address.0.state'
    );
    const zip = getPath(
      this.selectedPatient?.resource_raw,
      'address.0.postalCode'
    );
    return [`${line}`, `${city}, ${state} ${zip}`];
  }
}
