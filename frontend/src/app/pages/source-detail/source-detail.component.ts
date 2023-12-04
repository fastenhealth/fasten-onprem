import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Source} from '../../models/fasten/source';
import {FastenApiService} from '../../services/fasten-api.service';
import {ResourceFhir} from '../../models/fasten/resource_fhir';
import {getPath} from '../../components/fhir-datatable/datatable-generic-resource/utils';

@Component({
  selector: 'app-source-detail',
  templateUrl: './source-detail.component.html',
  styleUrls: ['./source-detail.component.scss']
})
export class SourceDetailComponent implements OnInit {
  loading: boolean = false

  selectedSource: Source = null
  selectedPatient: ResourceFhir = null
  selectedResourceType: string = null
  selectedTotalElements: number = 0

  resourceTypeCounts: { [name: string]: number } = {}

  constructor(private fastenApi: FastenApiService, private router: Router, private route: ActivatedRoute) {
    //check if the current Source was sent over using the router state storage:
    if(this.router.getCurrentNavigation()?.extras?.state){
      this.selectedSource = this.router.getCurrentNavigation().extras.state as Source
    }
  }

  ngOnInit(): void {
    this.loading = true
    //always request the source summary
    this.fastenApi.getSourceSummary(this.route.snapshot.paramMap.get('source_id')).subscribe((sourceSummary) => {
      this.loading = false
      this.selectedSource = sourceSummary.source;
      this.selectedPatient = sourceSummary.patient;
      for(let resourceTypeCount of sourceSummary.resource_type_counts){
        this.resourceTypeCounts[resourceTypeCount.resource_type] = resourceTypeCount.count
      }
    }, error => {
      this.loading = false
    });
  }

  selectResourceType(resourceType: string) {
    this.selectedResourceType = resourceType
    this.selectedTotalElements = this.resourceTypeCounts[resourceType]
  }

  //functions to call on patient
  getPatientName(){
    // @ts-ignore
    return `${getPath(this.selectedPatient?.resource_raw, 'name.0.family')}, ${(getPath(this.selectedPatient?.resource_raw, 'name.0.given')||[]).join(' ')}`
  }
  getPatientGender(){
    return getPath(this.selectedPatient?.resource_raw, 'gender')
  }
  getPatientMRN(){
    return getPath(this.selectedPatient?.resource_raw, 'identifier.0.value')
  }
  getPatientEmail(){
    // @ts-ignore
    return (this.selectedPatient?.resource_raw?.telecom || []).filter(
      telecom => telecom.system === 'email',
    )[0]?.value
  }
  getPatientDOB(): string | number {
    return getPath(this.selectedPatient?.resource_raw, 'birthDate')
  }
  getPatientAge(){
    // Can return NaN or a valid integer
    var msInYear = 365 * 24 * 60 * 60 * 1000;
    var patientDOB = this.getPatientDOB();
    if (patientDOB == null) { return NaN; }
    if (typeof patientDOB === 'string') {
      patientDOB = Date.parse(patientDOB);
    }
    var age = Date.now() - patientDOB;
    return Math.floor(age / msInYear);
  }
  getPatientPhone(){
    // @ts-ignore
    return (this.selectedPatient?.resource_raw?.telecom || []).filter(
      telecom => telecom.system === 'phone',
    )[0]?.value
  }
  getPatientAddress(){
    const line = getPath(this.selectedPatient?.resource_raw, 'address.0.line')
    const city = getPath(this.selectedPatient?.resource_raw, 'address.0.city')
    const state = getPath(this.selectedPatient?.resource_raw, 'address.0.state')
    return `${line}, ${city}, ${state}`
  }

}
