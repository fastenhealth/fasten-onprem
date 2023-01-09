import {Component, Input, OnInit} from '@angular/core';
import {FastenApiService} from '../../services/fasten-api.service';
import {ResourceFhir} from '../../models/fasten/resource_fhir';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {ReportMedicalHistoryEditorComponent} from '../../components/report-medical-history-editor/report-medical-history-editor.component';
import {forkJoin} from 'rxjs';
// import {ReportEditorRelatedComponent} from '../../components/report-editor-related/report-editor-related.component';

@Component({
  selector: 'app-medical-history',
  templateUrl: './medical-history.component.html',
  styleUrls: ['./medical-history.component.scss']
})
export class MedicalHistoryComponent implements OnInit {
  loading: boolean = false

  closeResult = '';
  conditions: ResourceFhir[] = []

  unassigned_encounters: ResourceFhir[] = []
  resourceLookup: {[name: string]: ResourceFhir} = {}

  constructor(
    private fastenApi: FastenApiService,
    private modalService: NgbModal
  ) { }


  ngOnInit(): void {
    this.loading = true
    this.fastenApi.getResourceGraph().subscribe(results => {
      this.loading = false
      this.conditions = results["Condition"]
      this.unassigned_encounters = results["Encounter"]

      //populate a lookup table with all resources
      for(let condition of this.conditions){
        this.recPopulateResourceLookup(condition)
      }


      if(this.unassigned_encounters.length > 0){
        console.log("Found mapping:", this.resourceLookup)
        console.log("Found unassigned encounters:", this.unassigned_encounters.length, this.unassigned_encounters)
        this.conditions.push({
          fhir_version: '',
          resource_raw: {
            resourceType: "Condition",
            code:{
              text: "UNASSIGNED",
            }
          },
          source_id: 'UNASSIGNED',
          source_resource_id: 'UNASSIGNED',
          source_resource_type: 'UNASSIGNED',
          related_resources: this.unassigned_encounters
        } as any)
      }


    }, error => {
      this.loading = false
    })

  }

  openEditorRelated(): void {
    const modalRef = this.modalService.open(ReportMedicalHistoryEditorComponent);
    modalRef.componentInstance.conditions = this.conditions;
  }


  recPopulateResourceLookup(resourceFhir: ResourceFhir) {
    if(!resourceFhir){
      return
    }
    this.resourceLookup[`${resourceFhir.source_id}/${resourceFhir.source_resource_type}/${resourceFhir.source_resource_id}`] = resourceFhir

    if(!resourceFhir.related_resources){
      return
    } else {

      for(let relatedResourceFhir of resourceFhir.related_resources){
        this.recPopulateResourceLookup(relatedResourceFhir)
      }

      return
    }
  }



  // private getDismissReason(reason: any): string {
  //   if (reason === ModalDismissReasons.ESC) {
  //     return 'by pressing ESC';
  //   } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
  //     return 'by clicking on a backdrop';
  //   } else {
  //     return `with: ${reason}`;
  //   }
  // }
}
