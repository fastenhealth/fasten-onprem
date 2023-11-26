import { Component, OnInit } from '@angular/core';
import {NgbActiveModal, NgbNavModule} from '@ng-bootstrap/ng-bootstrap';
import {FastenApiService} from '../../services/fasten-api.service';

@Component({
  standalone: true,
  imports: [NgbNavModule],
  selector: 'app-medical-record-wizard',
  templateUrl: './medical-record-wizard.component.html',
  styleUrls: ['./medical-record-wizard.component.scss']
})
export class MedicalRecordWizardComponent implements OnInit {
  active = 'visit';

  constructor(
    public activeModal: NgbActiveModal,
    private fastenApi: FastenApiService,
  ) { }

  ngOnInit(): void {
  }

}
