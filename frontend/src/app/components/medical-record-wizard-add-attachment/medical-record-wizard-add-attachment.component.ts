import {Component, Input, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
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
  @Input() debugMode: boolean = false;

  newAttachmentForm: FormGroup

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
    this.resetAttachmentForm()
  }

  submit() {
    this.newAttachmentForm.markAllAsTouched()
    if(this.newAttachmentForm.valid){
      this.activeModal.close(this.newAttachmentForm.getRawValue());
    }
  }

  onAttachmentFileChange($event){
    let fileInput = $event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files[0]) {
      let processingFile = fileInput.files[0]
      let reader = new FileReader();
      reader.onloadend = () => {
        // use a regex to remove data url part
        const base64String = (reader.result as string).replace('data:', '').replace(/^.+,/, '');
        this.newAttachmentForm.get('file_content').setValue(base64String)
      };
      reader.readAsDataURL(processingFile);
      this.newAttachmentForm.get('file_name').setValue(processingFile.name)
      this.newAttachmentForm.get('file_size').setValue(processingFile.size)
    }
  }

  private resetAttachmentForm(){

    this.newAttachmentForm = new FormGroup({
      name: new FormControl(null, Validators.required),
      category: new FormControl(null, Validators.required),
      file_type: new FormControl(null, Validators.required),
      file_name: new FormControl(null, Validators.required),
      file_content: new FormControl(null, Validators.required),
      file_size: new FormControl(null),
    })
  }
}
