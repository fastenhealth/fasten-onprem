import {Component, Input, OnInit} from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {ResourceFhir} from '../../models/fasten/resource_fhir';
import {FastenApiService} from '../../services/fasten-api.service';
import * as fhirpath from 'fhirpath';
import {ITreeOptions} from '@circlon/angular-tree-component';

class RelatedNode {
  name: string
  source_resource_type: string
  source_resource_id: string
  source_id: string
  children: RelatedNode[]
  show_checkbox: boolean
  resource: ResourceFhir
}

@Component({
  selector: 'app-report-medical-history-editor',
  templateUrl: './report-medical-history-editor.component.html',
  styleUrls: ['./report-medical-history-editor.component.scss']
})
export class ReportMedicalHistoryEditorComponent implements OnInit {

  @Input() conditions: ResourceFhir[] = []
  resourceLookup: {[name: string]: ResourceFhir} = {}
  compositionTitle: string = ""

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
  options: ITreeOptions = {
    allowDrag: false,
    allowDrop: false,
  }

  selectedResources:{ [id:string]: ResourceFhir} = {}
  constructor(
    public activeModal: NgbActiveModal,
    private fastenApi: FastenApiService,
  ) { }

  ngOnInit(): void {
    console.log("ngOnInit STATUS", this.conditions)
    this.nodes = this.generateNodes(this.conditions)
  }


  onResourceCheckboxClick($event, node:{data:RelatedNode}){
    let key = `${node.data.source_id}/${node.data.source_resource_type}/${node.data.source_resource_id}`
    if($event.target.checked){
      this.selectedResources[key] = node.data.resource
      if(!this.compositionTitle){
        this.compositionTitle = node.data.resource.sort_title
      }
    } else {
      //delete this key (unselected)
      delete this.selectedResources[key]
    }
    console.log("selected resources", this.selectedResources)
  }

  onMergeResourcesClick() {

    let resources: ResourceFhir[] = []
    for(let key in this.selectedResources){
      resources.push(this.selectedResources[key])
    }

    this.fastenApi.createResourceComposition(this.compositionTitle, resources).subscribe(results => {
      console.log(results)
      this.activeModal.close()
    },(err) => {})
  }



  generateNodes(resouceFhirList: ResourceFhir[]): RelatedNode[] {
    let relatedNodes = resouceFhirList.map((resourceFhir) => { return this.recGenerateNode(resourceFhir) })
    for(let relatedNode of relatedNodes){
      if(relatedNode.source_id  == 'UNASSIGNED' && relatedNode.source_resource_type == 'Condition' && relatedNode.source_resource_id == 'UNASSIGNED'){
        //this is a placeholder for the Unassigned resources. This resource cannot be merged, but all child resources can be, so lets set them to true
        for(let unassignedEncounters of relatedNode.children){
          unassignedEncounters.show_checkbox = true
        }
      } else {
        relatedNode.show_checkbox = true
      }
    }

    console.log("NODES:", relatedNodes)
    return relatedNodes
  }

  recGenerateNode(resourceFhir: ResourceFhir): RelatedNode {
    let relatedNode = {
      show_checkbox: false,
      source_id: resourceFhir.source_id,
      name: `[${resourceFhir.source_resource_type}/${resourceFhir.source_resource_id.length > 10 ? resourceFhir.source_resource_id.substring(0, 10)+ '...' : resourceFhir.source_resource_id}] `,
      source_resource_id: resourceFhir.source_resource_id,
      source_resource_type: resourceFhir.source_resource_type,
      children: [],
      resource: resourceFhir
    }

    switch (resourceFhir.source_resource_type) {
      case "Condition":
        relatedNode.name += resourceFhir.sort_title || ` ${fhirpath.evaluate(resourceFhir.resource_raw, "Condition.onsetPeriod.start")} ${fhirpath.evaluate(resourceFhir.resource_raw, "Condition.code.text.first()")}`
        if(resourceFhir.sort_date){
          relatedNode.name += ` - ${new Date(resourceFhir.sort_date).toLocaleDateString("en-US")}`
        }
      break
      case "Encounter":
        relatedNode.name += resourceFhir.sort_title ||` ${fhirpath.evaluate(resourceFhir.resource_raw, "Encounter.period.start")} ${fhirpath.evaluate(resourceFhir.resource_raw, "Encounter.location.first().location.display")}`
        if(resourceFhir.sort_date){
          relatedNode.name += ` - ${new Date(resourceFhir.sort_date).toLocaleDateString("en-US")}`
        }
        break
      case "CareTeam":
        relatedNode.name += resourceFhir.sort_title || ` ${fhirpath.evaluate(resourceFhir.resource_raw, "CareTeam.participant.member.display")}`
        break
      case "Location":
        relatedNode.name += resourceFhir.sort_title || ` ${fhirpath.evaluate(resourceFhir.resource_raw, "Location.name")}`
        break
      case "Organization":
        relatedNode.name += resourceFhir.sort_title || ` ${fhirpath.evaluate(resourceFhir.resource_raw, "Organization.name")}`
        break
      case "Practitioner":
        relatedNode.name += resourceFhir.sort_title || ` ${fhirpath.evaluate(resourceFhir.resource_raw, "Practitioner.name.family")}`
        break
      case "MedicationRequest":
        relatedNode.name += resourceFhir.sort_title || ` ${fhirpath.evaluate(resourceFhir.resource_raw, "MedicationRequest.medicationReference.display")}`
        break
      default:
        relatedNode.name += resourceFhir.sort_title
    }

    this.resourceLookup[`${resourceFhir.source_id}/${resourceFhir.source_resource_type}/${resourceFhir.source_resource_id}`] = resourceFhir

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
