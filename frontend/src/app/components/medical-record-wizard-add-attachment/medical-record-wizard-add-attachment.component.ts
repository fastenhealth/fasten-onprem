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
  selector: 'app-medical-record-wizard-add-attachment',
  templateUrl: './medical-record-wizard-add-attachment.component.html',
  styleUrls: ['./medical-record-wizard-add-attachment.component.scss']
})
export class MedicalRecordWizardAddAttachmentComponent implements OnInit {
  debugMode = false;

  newAttachmentForm: FormGroup

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
  }

  onAttachmentFileChange($event){
    console.log("onAttachmentFileChange")
    let fileInput = $event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files[0]) {
      let reader = new FileReader();
      reader.onloadend = () => {
        // use a regex to remove data url part
        const base64String = (reader.result as string).replace('data:', '').replace(/^.+,/, '');
        this.newAttachmentForm.get('file_content').setValue(base64String)
      };
      reader.readAsDataURL(fileInput.files[0]);
      this.newAttachmentForm.get('file_name').setValue(fileInput.files[0].name)
      this.newAttachmentForm.get('file_size').setValue(fileInput.files[0].size)
    }
  }
}
