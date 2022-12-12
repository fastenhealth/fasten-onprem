import {Component, Input, OnInit} from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {ResourceFhir} from '../../models/fasten/resource_fhir';
import {FastenApiService} from '../../services/fasten-api.service';
import * as fhirpath from 'fhirpath';

class RelatedNode {
  name: string
  resourceType: string
  resourceId: string
  sourceId: string
  draggable: boolean
  children: RelatedNode[]
}

@Component({
  selector: 'app-report-medical-history-editor',
  templateUrl: './report-medical-history-editor.component.html',
  styleUrls: ['./report-medical-history-editor.component.scss']
})
export class ReportMedicalHistoryEditorComponent implements OnInit {

  @Input() conditions: ResourceFhir[] = []
  @Input() encounters: ResourceFhir[] = []

  assignedEncounters: {[name: string]: ResourceFhir} = {}

  nodes = [
    // {
    //   id: 1,
    //   name: 'root1',
    //   children: [
    //     { id: 2, name: 'child1' },
    //     { id: 3, name: 'child2' }
    //   ]
    // },
    // {
    //   id: 4,
    //   name: 'root2',
    //   children: [
    //     { id: 5, name: 'child2.1' },
    //     {
    //       id: 6,
    //       name: 'child2.2',
    //       children: [
    //         { id: 7, name: 'subsub' }
    //       ]
    //     }
    //   ]
    // }
  ];
  options = {
    allowDrag: (node) => {return node.data.draggable},
    allowDrop: (element, { parent, index }) => {
      // return true / false based on element, to.parent, to.index. e.g.
      return parent.data.resourceType == "Condition";
    },

  }

  constructor(
    public activeModal: NgbActiveModal,
    private fastenApi: FastenApiService,
  ) { }

  ngOnInit(): void {
    this.nodes = this.generateNodes(this.conditions)
  }


  onResourceMoved($event) {

    this.fastenApi.replaceResourceAssociation({

      source_id: $event.to.parent.sourceId,
      source_resource_type: $event.to.parent.resourceType,
      source_resource_id: $event.to.parent.resourceId,

      new_related_source_id: $event.node.sourceId,
      new_related_source_resource_type: $event.node.resourceType,
      new_related_source_resource_id: $event.node.resourceId,


    }).subscribe(results => {
      console.log(results)
    })
  }



  generateNodes(resouceFhirList: ResourceFhir[]): RelatedNode[] {
    let relatedNodes = resouceFhirList.map((resourceFhir) => { return this.recGenerateNode(resourceFhir) })

    //create an unassigned encounters "condition"
    if(this.encounters.length > 0){
      let unassignedCondition = {
        name: "[Unassigned Encounters]",
        resourceType: "Condition",
        resourceId: "UNASSIGNED",
        sourceId: "UNASSIGNED",
        draggable: false,
        children: []
      }

      for(let encounter of this.encounters){
        let encounterId = `${encounter.source_id}/${encounter.source_resource_type}/${encounter.source_resource_id}`
        if(!this.assignedEncounters[encounterId]){
          this.assignedEncounters[encounterId] = encounter
          unassignedCondition.children.push(this.recGenerateNode(encounter))
        }
      }

      if(unassignedCondition.children.length > 0){
        //only add the unassigned condition block if the subchildren list is populated.
        relatedNodes.push(unassignedCondition)
      }
    }

    console.log("NODES:", relatedNodes)
    return relatedNodes
  }

  recGenerateNode(resourceFhir: ResourceFhir): RelatedNode {
    let relatedNode = {
      sourceId: resourceFhir.source_id,
      name: `[${resourceFhir.source_resource_type}/${resourceFhir.source_resource_id}]`,
      resourceId: resourceFhir.source_resource_id,
      resourceType: resourceFhir.source_resource_type,
      draggable: resourceFhir.source_resource_type == "Encounter" || resourceFhir.source_resource_type == "Condition",
      children: [],
    }

    switch (resourceFhir.source_resource_type) {
      case "Condition":
        relatedNode.name += ` ${fhirpath.evaluate(resourceFhir.resource_raw, "Condition.onsetPeriod.start")} ${fhirpath.evaluate(resourceFhir.resource_raw, "Condition.code.text.first()")}`
      break
      case "Encounter":
        relatedNode.name += ` ${fhirpath.evaluate(resourceFhir.resource_raw, "Encounter.period.start")} ${fhirpath.evaluate(resourceFhir.resource_raw, "Encounter.location.first().location.display")}`
        break
      case "CareTeam":
        relatedNode.name += ` ${fhirpath.evaluate(resourceFhir.resource_raw, "CareTeam.participant.member.display")}`
        break
      case "Location":
        relatedNode.name += ` ${fhirpath.evaluate(resourceFhir.resource_raw, "Location.name")}`
        break
      case "Organization":
        relatedNode.name += ` ${fhirpath.evaluate(resourceFhir.resource_raw, "Organization.name")}`
        break
      case "Practitioner":
        relatedNode.name += ` ${fhirpath.evaluate(resourceFhir.resource_raw, "Practitioner.name.family")}`
        break
      case "MedicationRequest":
        relatedNode.name += ` ${fhirpath.evaluate(resourceFhir.resource_raw, "MedicationRequest.medicationReference.display")}`
        break
    }

    this.assignedEncounters[`${resourceFhir.source_id}/${resourceFhir.source_resource_type}/${resourceFhir.source_resource_id}`] = resourceFhir

    if(!resourceFhir.related_resources){
      return relatedNode
    } else {
      relatedNode.children = resourceFhir.related_resources.map((relatedResourceFhir)=>{
        return this.recGenerateNode(relatedResourceFhir)
      })
      return relatedNode
    }
  }

}
