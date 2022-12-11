import {Component, Input, OnInit} from '@angular/core';
import {ResourceFhir} from '../../models/fasten/resource_fhir';

@Component({
  selector: 'app-report-medical-history-condition',
  templateUrl: './report-medical-history-condition.component.html',
  styleUrls: ['./report-medical-history-condition.component.scss']
})
export class ReportMedicalHistoryConditionComponent implements OnInit {


  @Input() condition: ResourceFhir

  careTeams: {[careTeamId: string]: ResourceFhir} = {}
  practitioners: {[practitionerId: string]: ResourceFhir} = {}
  encounters: {[encounterId: string]: ResourceFhir} = {}


  constructor() { }

  ngOnInit(): void {

    for(let resource of this.condition.related_resources){
      this.recExtractResources(resource)
    }

    // console.log("EXTRACTED CARETEAM",  this.careTeams)
    // console.log("EXTRACTED practitioners",  this.practitioners)
    // console.log("EXTRACTED encounters",  this.encounters)
  }

  recExtractResources(resource: ResourceFhir){
    if(resource.source_resource_type == "CareTeam"){
      this.careTeams[this.genResourceId(resource)] = resource
    } else if (resource.source_resource_type == "Practitioner"){
      this.practitioners[this.genResourceId(resource)] = resource
    } else if (resource.source_resource_type == "Encounter"){
      this.encounters[this.genResourceId(resource)] = resource
    }
    if(!resource.related_resources){
      return
    }
    for(let relatedResource of resource.related_resources){
      this.recExtractResources(relatedResource)
    }
  }

  genResourceId(relatedResource: ResourceFhir): string {
    return `${relatedResource.source_id}/${relatedResource.source_resource_type}/${relatedResource.source_resource_id}`
  }

}
