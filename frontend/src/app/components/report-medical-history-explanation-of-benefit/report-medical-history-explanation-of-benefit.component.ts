import {Component, Input, OnInit} from '@angular/core';
import {ResourceFhir} from '../../models/fasten/resource_fhir';
import {FastenDisplayModel} from '../../../lib/models/fasten/fasten-display-model';
import {ResourceType} from '../../../lib/models/constants';
import {CareTeamModel} from '../../../lib/models/resources/care-team-model';
import {PractitionerModel} from '../../../lib/models/resources/practitioner-model';
import {RecResourceRelatedDisplayModel} from '../../../lib/utils/resource_related_display_model';
import {EncounterModel} from '../../../lib/models/resources/encounter-model';
import * as _ from "lodash";
import {ExplanationOfBenefitModel} from '../../../lib/models/resources/explanation-of-benefit-model';
import {MedicationModel} from '../../../lib/models/resources/medication-model';
import {ProcedureModel} from '../../../lib/models/resources/procedure-model';
import {DiagnosticReportModel} from '../../../lib/models/resources/diagnostic-report-model';
import {DeviceModel} from '../../../lib/models/resources/device-model';
import {CodingModel} from '../../../lib/models/datatypes/coding-model';
import {LocationModel} from '../../../lib/models/resources/location-model';

@Component({
  selector: 'app-report-medical-history-explanation-of-benefit',
  templateUrl: './report-medical-history-explanation-of-benefit.component.html',
  styleUrls: ['./report-medical-history-explanation-of-benefit.component.scss']
})
export class ReportMedicalHistoryExplanationOfBenefitComponent implements OnInit {

  @Input() explanationOfBenefitGroup: ResourceFhir

  eobDisplayModel: Partial<ExplanationOfBenefitModel>

  //lookup table for all resources
  resourcesLookup: {[name:string]: FastenDisplayModel} = {}

  condition: CodingModel

  //EOB embeds multiple resource type references
  involvedInCare: {displayName: string, role?: string, email?: string}[] = []
  locations: LocationModel[] = []
  encounters: EncounterModel[] = []
  medications: {[resourceId: string]: MedicationModel[]} = {}
  procedures: ProcedureModel[] = []
  diagnosticReports: {[encounterResourceId: string]: DiagnosticReportModel[]} = {}
  device: {[encounterResourceId: string]: DeviceModel[]} = {}

  constructor() { }

  ngOnInit(): void {
    if(!this.explanationOfBenefitGroup){
      return
    }

    //add resources to the lookup table, ensure uniqueness.
    let result = RecResourceRelatedDisplayModel(this.explanationOfBenefitGroup)
    this.resourcesLookup = result.resourcesLookup
    this.eobDisplayModel = result.displayModel


    console.log("Resources Lookup", this.resourcesLookup)

    let involvedInCareMap: {[resource_id: string]: {displayName: string, role?: string, email?: string}} = {}

    //extract data from EOB directly
    this.condition = this.eobDisplayModel.diagnosis?.[0]?.diagnosisCodeableConcept?.coding?.[0]
    this.eobDisplayModel.careTeam?.forEach((careTeam) => {
      if(careTeam.provider.reference){
        return
      }
      let id = careTeam.role + careTeam.provider.display
      involvedInCareMap[id] = _.mergeWith(
        {},
        involvedInCareMap[id],
        {
          displayName: careTeam.provider?.display,
          role: careTeam.role?.[0]?.text,
        },
      )
    })

    this.eobDisplayModel.procedures?.forEach((procedure) => {
      let procedureModel = new ProcedureModel({})
      procedureModel.performed_datetime = procedure.date
      procedureModel.coding = procedure.procedureCodeableConcept.coding
      procedureModel.display = procedure.procedureCodeableConcept.text || procedure.procedureCodeableConcept.coding?.[0]?.display
      this.procedures.push(procedureModel)
    })

    console.log("CONDITION", this.condition)

    // this.medications = this.eobDisplayModel.prescription


    //loop though all resources, process display data
    for(let resourceId in this.resourcesLookup){
      let resource = this.resourcesLookup[resourceId]

      switch(resource.source_resource_type){
        case ResourceType.CareTeam:
          for(let participant of (resource as CareTeamModel).participants){
            let id = participant.reference.reference || participant.display
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

          let telecomEmails = _.find(practitionerModel.telecom, {"system": "email"})
          let email = _.get(telecomEmails, '[0].value')
          let qualification = _.find(practitionerModel.qualification, {"system": "http://nucc.org/provider-taxonomy"}) as CodingModel

          involvedInCareMap[id] = _.mergeWith(
            {},
            involvedInCareMap[id],
            {
              displayName: practitionerModel.name?.family && practitionerModel.name?.given ? `${practitionerModel.name?.family }, ${practitionerModel.name?.given}` : practitionerModel.name?.text,
              role: qualification?.display || practitionerModel.name?.prefix || practitionerModel.name?.suffix,
              email: email,
            },
          )


          break
        case ResourceType.Encounter:
          this.encounters.push(resource as EncounterModel);
          (resource as EncounterModel).participant?.map((participant) => {
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
        case ResourceType.Location:
          this.locations.push(resource as LocationModel)
        // case ResourceType.ExplanationOfBenefit:
        //   let eobDisplayModel = (resource as ExplanationOfBenefitModel)
        //   involvedInCareMap[eobDisplayModel.provider.reference] =
          break
        case ResourceType.Procedure:
          this.procedures.push(resource as ProcedureModel)
          break
      }

    }

    console.log("GENERATED INVOLVED IN CARE MAP", involvedInCareMap)
    for(let resourceId in involvedInCareMap){
      this.involvedInCare.push(involvedInCareMap[resourceId])
    }
  }

}
