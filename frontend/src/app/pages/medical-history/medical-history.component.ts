import {Component, Input, OnInit} from '@angular/core';
import {FastenApiService} from '../../services/fasten-api.service';
import {ResourceFhir} from '../../models/fasten/resource_fhir';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {ReportEditorRelatedComponent} from '../../components/report-editor-related/report-editor-related.component';
// import {ReportEditorRelatedComponent} from '../../components/report-editor-related/report-editor-related.component';

@Component({
  selector: 'app-medical-history',
  templateUrl: './medical-history.component.html',
  styleUrls: ['./medical-history.component.scss']
})
export class MedicalHistoryComponent implements OnInit {
  closeResult = '';
  conditions: ResourceFhir[] = []
  encounters: ResourceFhir[] = []
  constructor(
    private fastenApi: FastenApiService,
    private modalService: NgbModal
  ) { }


  ngOnInit(): void {

    this.fastenApi.getResources("Condition", null, null, true).subscribe(results => {
      console.log(results)
      this.conditions = results
    })
    this.fastenApi.getResources("Encounter", null, null, true).subscribe(results => {
      console.log(results)
      this.encounters = results
    })
  }

  openEditorRelated(): void {
    const modalRef = this.modalService.open(ReportEditorRelatedComponent);
    modalRef.componentInstance.conditions = this.conditions;
    modalRef.componentInstance.encounters = this.encounters;

    // this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then(
    //   (result) => {
    //     this.closeResult = `Closed with: ${result}`;
    //   },
    //   (reason) => {
    //     this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    //   },
    // );
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
