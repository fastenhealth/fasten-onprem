import {Component, Input, OnInit} from '@angular/core';
import {FastenApiService} from '../../services/fasten-api.service';
import {ResourceFhir} from '../../models/fasten/resource_fhir';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {ReportMedicalHistoryEditorComponent} from '../../components/report-medical-history-editor/report-medical-history-editor.component';
import {forkJoin} from 'rxjs';
import {ResourceGraphMetadata, ResourceGraphResponse} from '../../models/fasten/resource-graph-response';
// import {ReportEditorRelatedComponent} from '../../components/report-editor-related/report-editor-related.component';

@Component({
  selector: 'app-medical-history',
  templateUrl: './medical-history.component.html',
  styleUrls: ['./medical-history.component.scss']
})
export class MedicalHistoryComponent implements OnInit {
  loading: boolean = false

  closeResult = '';
  // conditions: ResourceFhir[] = []
  // explanationOfBenefits: ResourceFhir[] = []
  //
  // unassigned_encounters: ResourceFhir[] = []
  // resourceLookup: {[name: string]: ResourceFhir} = {}

  encounters: ResourceFhir[] = []

  resourceGraphMetadata: ResourceGraphMetadata = {
    total_elements: 0,
    page_size: 0,
    page: 1
  }

  constructor(
    private fastenApi: FastenApiService,
    private modalService: NgbModal
  ) { }


  ngOnInit(): void {
    //load the first page
    this.pageChange(1)
  }

  pageChange(page: number){
    this.loading = true

    this.fastenApi.getResources('Encounter').subscribe(
      (response: ResourceFhir[]) => {
        this.loading = false
        this.encounters = response
      },
      error => {
        this.loading = false
      }
    )

    // this.fastenApi.getResourceGraph(null, page).subscribe((response: ResourceGraphResponse) => {
    //   this.loading = false
    //   this.resourceGraphMetadata = response.metadata
    //   //page counter is 1 indexed but the backend is 0 indexed
    //   this.resourceGraphMetadata.page = this.resourceGraphMetadata.page + 1
    //
    //   this.conditions = [].concat(response.results["Condition"] || [], response.results["Composition"] || [])
    //   this.unassigned_encounters = response.results["Encounter"] || []
    //   this.explanationOfBenefits = response.results["ExplanationOfBenefit"] || []
    //
    //   //populate a lookup table with all resources
    //   for(let condition of this.conditions){
    //     this.recPopulateResourceLookup(condition)
    //   }
    //
    //
    //   if(this.unassigned_encounters.length > 0){
    //     console.log("Found mapping:", this.resourceLookup)
    //     console.log("Found unassigned encounters:", this.unassigned_encounters.length, this.unassigned_encounters)
    //     this.conditions.push({
    //       fhir_version: '',
    //       resource_raw: {
    //         resourceType: "Condition",
    //         code:{
    //           text: "UNASSIGNED",
    //         }
    //       },
    //       source_id: 'UNASSIGNED',
    //       source_resource_id: 'UNASSIGNED',
    //       source_resource_type: 'Condition',
    //       related_resources: this.unassigned_encounters
    //     } as any)
    //   }
    //
    //
    // }, error => {
    //   this.loading = false
    // })

  }

  //
  // openEditorRelated(): void {
  //   const modalRef = this.modalService.open(ReportMedicalHistoryEditorComponent, {
  //     size: 'xl',
  //   });
  //   modalRef.componentInstance.conditions = this.conditions;
  // }


  // recPopulateResourceLookup(resourceFhir: ResourceFhir) {
  //   if(!resourceFhir){
  //     return
  //   }
  //   this.resourceLookup[`${resourceFhir.source_id}/${resourceFhir.source_resource_type}/${resourceFhir.source_resource_id}`] = resourceFhir
  //
  //   if(!resourceFhir.related_resources){
  //     return
  //   } else {
  //
  //     for(let relatedResourceFhir of resourceFhir.related_resources){
  //       this.recPopulateResourceLookup(relatedResourceFhir)
  //     }
  //
  //     return
  //   }
  // }



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
