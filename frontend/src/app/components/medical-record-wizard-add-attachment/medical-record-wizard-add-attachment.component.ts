import { Component, OnInit } from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NlmTypeaheadComponent} from '../nlm-typeahead/nlm-typeahead.component';
import {HighlightModule} from 'ngx-highlightjs';
import {NgbTooltipModule} from '@ng-bootstrap/ng-bootstrap';

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
  selector: 'app-medical-record-wizard-add-attachment',
  templateUrl: './medical-record-wizard-add-attachment.component.html',
  styleUrls: ['./medical-record-wizard-add-attachment.component.scss']
})
export class MedicalRecordWizardAddAttachmentComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
