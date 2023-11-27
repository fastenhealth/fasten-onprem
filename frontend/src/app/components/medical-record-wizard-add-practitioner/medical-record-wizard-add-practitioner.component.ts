import { Component, OnInit } from '@angular/core';
import {NgbActiveModal, NgbDatepickerModule, NgbNavModule, NgbTooltipModule, NgbTypeaheadModule} from '@ng-bootstrap/ng-bootstrap';
import {CommonModule} from '@angular/common';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NlmTypeaheadComponent} from '../nlm-typeahead/nlm-typeahead.component';
import {HighlightModule} from 'ngx-highlightjs';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NlmTypeaheadComponent,
    HighlightModule,
    NgbTooltipModule
  ],
  selector: 'app-medical-record-wizard-add-practitioner',
  templateUrl: './medical-record-wizard-add-practitioner.component.html',
  styleUrls: ['./medical-record-wizard-add-practitioner.component.scss']
})
export class MedicalRecordWizardAddPractitionerComponent implements OnInit {
  debugMode = false;

  newPractitionerTypeaheadForm: FormGroup
  newPractitionerForm: FormGroup //ResourceCreatePractitioner

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
  }

}
