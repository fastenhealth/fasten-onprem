import {Component, Input, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
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
  selector: 'app-medical-record-wizard-add-lab-results',
  templateUrl: './medical-record-wizard-add-lab-results.component.html',
  styleUrls: ['./medical-record-wizard-add-lab-results.component.scss']
})
export class MedicalRecordWizardAddLabResultsComponent implements OnInit {
  @Input() debugMode: boolean = false;

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
  }

  submit() {
    // this.newAttachmentForm.markAllAsTouched()
    // if(this.newAttachmentForm.valid){
    //   this.activeModal.close(this.newAttachmentForm.getRawValue());
    // }
  }
}
