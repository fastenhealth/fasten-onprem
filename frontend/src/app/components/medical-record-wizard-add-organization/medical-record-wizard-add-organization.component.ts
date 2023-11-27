import { Component, OnInit } from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NlmTypeaheadComponent} from '../nlm-typeahead/nlm-typeahead.component';
import {HighlightModule} from 'ngx-highlightjs';
import {NgbActiveModal, NgbTooltipModule} from '@ng-bootstrap/ng-bootstrap';

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
  selector: 'app-medical-record-wizard-add-organization',
  templateUrl: './medical-record-wizard-add-organization.component.html',
  styleUrls: ['./medical-record-wizard-add-organization.component.scss']
})
export class MedicalRecordWizardAddOrganizationComponent implements OnInit {
  debugMode = false;

  newOrganizationTypeaheadForm: FormGroup
  newOrganizationForm: FormGroup //ResourceCreateOrganization

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
  }

}
