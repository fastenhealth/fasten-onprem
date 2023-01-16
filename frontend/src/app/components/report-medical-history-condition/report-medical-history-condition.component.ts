import {Component, Input, OnInit} from '@angular/core';
import {ResourceFhir} from '../../models/fasten/resource_fhir';
import {CareTeamModel} from '../../../lib/models/resources/care-team-model';
import {PractitionerModel} from '../../../lib/models/resources/practitioner-model';
import {EncounterModel} from '../../../lib/models/resources/encounter-model';
import {fhirModelFactory} from '../../../lib/models/factory';
import {fhirVersions, ResourceType} from '../../../lib/models/constants';
import {MedicationModel} from '../../../lib/models/resources/medication-model';
import {ProcedureModel} from '../../../lib/models/resources/procedure-model';
import {DeviceModel} from '../../../lib/models/resources/device-model';
import {DiagnosticReportModel} from '../../../lib/models/resources/diagnostic-report-model';
import {FastenDisplayModel} from '../../../lib/models/fasten/fasten-display-model';
import * as _ from "lodash";

@Component({
  selector: 'app-report-medical-history-condition',
  templateUrl: './report-medical-history-condition.component.html',
  styleUrls: ['./report-medical-history-condition.component.scss']
})

export class ReportMedicalHistoryConditionComponent implements OnInit {


  /*
  * conditionGroup is either a Condition or Composite object
  *
  * Condition
    ├─ related_resources
    │  ├─ Encounter1
    │  │  ├─ Location
    │  ├─ Encounter2
    │  │  ├─ Observation
    │  ├─ Observation
    │  ├─ Location
  *
  * or
  * Composite
    ├─ related_resources
    │  ├─ Condition2
    │  ├─ Condition
    │  │  ├─ related_resources
    │  │  │  ├─ Encounter1
    │  │  │  │  ├─ Location
    │  │  │  ├─ Encounter2
    │  │  │  │  ├─ Observation
    │  │  │  ├─ Observation
    │  │  │  ├─ Location

      *
  * */
  @Input() conditionGroup: ResourceFhir

  conditionDisplayModel: FastenDisplayModel

  //lookup table for all resources
  resourcesLookup: {[name:string]: FastenDisplayModel} = {}

  involvedInCare: {displayName: string, role?: string, email?: string}[] = []
  encounters: EncounterModel[] = []
  // medications: {[encounterResourceId: string]: MedicationModel[]} = {}
  // procedures: {[encounterResourceId: string]: ProcedureModel[]} = {}
  // diagnosticReports: {[encounterResourceId: string]: DiagnosticReportModel[]} = {}
  // device: {[encounterResourceId: string]: DeviceModel[]} = {}

  constructor() { }

  ngOnInit(): void {

    //add resources to the lookup table, ensure uniqueness.
    this.conditionDisplayModel = this.recExtractResources(this.conditionGroup)

    let involvedInCareMap: {[resource_id: string]: {displayName: string, role?: string, email?: string}} = {}

    //loop though all resources, process display data
    for(let resourceId in this.resourcesLookup){
      let resource = this.resourcesLookup[resourceId]

      switch(resource.source_resource_type){
        case ResourceType.CareTeam:
          for(let participant of (resource as CareTeamModel).participants){
            let id = participant.reference || participant.display
            involvedInCareMap[id] = _.mergeWith(
              {},
              involvedInCareMap[id],
              {
                displayName: participant.display,
                role: participant.role
              },
            )
          }
          break
        case ResourceType.Practitioner:
          let practitionerModel = resource as PractitionerModel
          let id = `${resource.source_resource_type}/${resource.source_resource_id}`

          let telecomEmails =_.find(practitionerModel.telecom, {"system": "email"})
          let email = _.get(telecomEmails, '[0].value')
          involvedInCareMap[id] = _.mergeWith(
            {},
            involvedInCareMap[id],
            {
              displayName: practitionerModel.name?.family && practitionerModel.name?.given ? `${practitionerModel.name?.family }, ${practitionerModel.name?.given}` : practitionerModel.name?.text,
              role: practitionerModel.name?.prefix || practitionerModel.name?.suffix,
              email: email,
            },
          )


          break
        case ResourceType.Encounter:
          this.encounters.push(resource as EncounterModel);

          (resource as EncounterModel).participant.map((participant) => {
            let id = participant.reference.reference
            involvedInCareMap[id] = _.mergeWith(
              {},
              involvedInCareMap[id],
              {
                displayName: participant.display,
                role: participant.role,
              },
            )
          })
          break
      }

    }

    console.log("GENERATED INVOLVED IN CARE MAP", involvedInCareMap)
    for(let resourceId in involvedInCareMap){
      this.involvedInCare.push(involvedInCareMap[resourceId])
    }
  }

  /*
  This function flattens all resources
   */
  recExtractResources(resource: ResourceFhir): FastenDisplayModel{
    let resourceId = this.genResourceId(resource)
    let resourceDisplayModel: FastenDisplayModel = this.resourcesLookup[resourceId]

    //ensure display model is populated
    if(!resourceDisplayModel){
      try{
        resourceDisplayModel = fhirModelFactory(resource.source_resource_type as ResourceType, resource)
        this.resourcesLookup[resourceId] = resourceDisplayModel
      }catch(e){
        console.error(e) //failed to parse a model
        return null
      }

    }

    if(!resource.related_resources){
      return resourceDisplayModel
    } else {
      for(let relatedResource of resource.related_resources){
        resourceDisplayModel.related_resources[relatedResource.source_resource_type] = resourceDisplayModel.related_resources[relatedResource.source_resource_type] || []

        let relatedResourceDisplayModel = this.recExtractResources(relatedResource)
        if(relatedResourceDisplayModel){
          resourceDisplayModel.related_resources[relatedResource.source_resource_type].push(relatedResourceDisplayModel)
        }
      }
    }
    return resourceDisplayModel
  }

  genResourceId(relatedResource: ResourceFhir): string {
    return `/source/${relatedResource.source_id}/resource/${relatedResource.source_resource_type}/${relatedResource.source_resource_id}`
  }

}
