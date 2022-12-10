import {Component, Input, OnInit} from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {ResourceFhir} from '../../models/fasten/resource_fhir';

class RelatedNode {
  id: string
  name: string
  resourceType: string
  draggable: boolean
  children: RelatedNode[]
}

@Component({
  selector: 'app-report-editor-related',
  templateUrl: './report-editor-related.component.html',
  styleUrls: ['./report-editor-related.component.scss']
})
export class ReportEditorRelatedComponent implements OnInit {

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
    }
  }

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
    this.nodes = this.generateNodes(this.conditions)
  }

  generateNodes(resouceFhirList: ResourceFhir[]): RelatedNode[] {
    let relatedNodes = resouceFhirList.map((resourceFhir) => { return this.recGenerateNode(resourceFhir) })

    //create an unassigned encounters "condition"
    if(this.encounters.length > 0){
      let unassignedCondition = {
        id: "UNASSIGNED",
        name: "[Unassigned Encounters]",
        resourceType: "Condition",
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
      id: `${resourceFhir.source_id}/${resourceFhir.source_resource_type}/${resourceFhir.source_resource_id}`,
      name: `${resourceFhir.source_resource_type}/${resourceFhir.source_resource_id}`, //todo, replace with extracted name
      draggable: resourceFhir.source_resource_type == "Encounter" || resourceFhir.source_resource_type == "Condition",
      resourceType: resourceFhir.source_resource_type,
      children: [],
    }
    this.assignedEncounters[relatedNode.id] = resourceFhir

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
