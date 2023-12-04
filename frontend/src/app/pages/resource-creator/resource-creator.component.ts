import {Component, OnInit} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import {MedicalRecordWizardComponent} from '../../components/medical-record-wizard/medical-record-wizard.component';
import {Router} from '@angular/router';

@Component({
  selector: 'app-resource-creator',
  templateUrl: './resource-creator.component.html',
  styleUrls: ['./resource-creator.component.scss']
})
export class ResourceCreatorComponent implements OnInit {

  constructor( private modalService: NgbModal, private router: Router) { }

  ngOnInit(): void {

    const modalRef = this.modalService.open(MedicalRecordWizardComponent, {
      // const modalRef = this.modalService.open(ReportMedicalHistoryEditorComponent, {
      size: 'xl',
    });

    //on close, we should redirect to the Medical history page.
    modalRef.result.then((result) => {
      this.router.navigate(['/medical-history']);
    }).catch((error) => {
      this.router.navigate(['/medical-history']);
    })
  }
}
