import {Component, OnInit} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import {MedicalRecordWizardComponent} from '../../components/medical-record-wizard/medical-record-wizard.component';

@Component({
  selector: 'app-resource-creator',
  templateUrl: './resource-creator.component.html',
  styleUrls: ['./resource-creator.component.scss']
})
export class ResourceCreatorComponent implements OnInit {

  constructor( private modalService: NgbModal) { }

  ngOnInit(): void {

    const modalRef = this.modalService.open(MedicalRecordWizardComponent, {
      // const modalRef = this.modalService.open(ReportMedicalHistoryEditorComponent, {
      size: 'xl',
    });
  }
}
