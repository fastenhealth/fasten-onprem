import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Source} from '../../models/fasten/source';
import {FastenApiService} from '../../services/fasten-api.service';
import {ResourceFhir} from '../../models/fasten/resource_fhir';
import {getPath} from '../../components/list-generic-resource/utils';


@Component({
  selector: 'app-source-detail',
  templateUrl: './source-detail.component.html',
  styleUrls: ['./source-detail.component.scss']
})
export class SourceDetailComponent implements OnInit {

  selectedSource: Source = null
  selectedPatient: ResourceFhir = null
  selectedResourceType: string = null

  resourceTypeCounts: { [name: string]: number } = {}

  constructor(private fastenApi: FastenApiService, private router: Router, private route: ActivatedRoute) {
    //check if the current Source was sent over using the router state storage:
    if(this.router.getCurrentNavigation().extras.state){
      this.selectedSource = this.router.getCurrentNavigation().extras.state as Source
    }
  }

  ngOnInit(): void {
    //always request the source summary
    this.fastenApi.getSourceSummary(this.route.snapshot.paramMap.get('source_id')).subscribe((sourceSummary) => {
      this.selectedSource = sourceSummary.source;
      this.selectedPatient = sourceSummary.patient;
      for(let resourceTypeCount of sourceSummary.resource_type_counts){
        this.resourceTypeCounts[resourceTypeCount.resource_type] = resourceTypeCount.count
      }
    });
  }

  selectResourceType(resourceType: string) {
    this.selectedResourceType = resourceType
  }

  //functions to call on patient
  getPatientName(){
    // @ts-ignore
    return `${getPath(this.selectedPatient?.payload, 'name.0.family')}, ${getPath(this.selectedPatient?.payload, 'name.0.given').join(' ')}`
  }
  getPatientGender(){
    return getPath(this.selectedPatient?.payload, 'gender')
  }
  getPatientMRN(){
    return getPath(this.selectedPatient?.payload, 'identifier.0.value')
  }
  getPatientEmail(){
    // @ts-ignore
    return (this.selectedPatient?.payload?.telecom || []).filter(
      telecom => telecom.system === 'email',
    )[0]?.value
  }
  getPatientDOB(){
    return getPath(this.selectedPatient?.payload, 'birthDate')

  }
  getPatientPhone(){
    // @ts-ignore
    return (this.selectedPatient?.payload?.telecom || []).filter(
      telecom => telecom.system === 'phone',
    )[0]?.value
  }
  getPatientAge(){
    return ''
  }
  getPatientAddress(){
    const line = getPath(this.selectedPatient?.payload, 'address.0.line')
    const city = getPath(this.selectedPatient?.payload, 'address.0.city')
    const state = getPath(this.selectedPatient?.payload, 'address.0.state')
    return `${line}, ${city}, ${state}`
  }

}
