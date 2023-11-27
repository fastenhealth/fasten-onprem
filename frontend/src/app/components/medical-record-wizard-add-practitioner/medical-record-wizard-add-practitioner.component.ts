import { Component, OnInit } from '@angular/core';
import {NgbActiveModal, NgbDatepickerModule, NgbNavModule, NgbTooltipModule, NgbTypeaheadModule} from '@ng-bootstrap/ng-bootstrap';
import {CommonModule} from '@angular/common';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
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
    this.resetPractitionerForm()
  }

  close() {
    this.activeModal.close({action: 'close', data: {hello: 'world'}});
  }

  private resetPractitionerForm(){
    this.newPractitionerTypeaheadForm = new FormGroup({
      data: new FormControl(null, Validators.required),
    })
    this.newPractitionerTypeaheadForm.valueChanges.subscribe(form => {
      console.log("CHANGE INDIVIDUAL IN MODAL", form)
      let val = form.data
      if(val.provider_type){
        this.newPractitionerForm.get('profession').setValue(val.provider_type)
      }
      if(val.identifier){
        this.newPractitionerForm.get('identifier').setValue( val.identifier);
      }
      if(form.data.provider_phone){
        this.newPractitionerForm.get('phone').setValue( val.provider_phone);
      }
      if(val.provider_fax){
        this.newPractitionerForm.get('fax').setValue(val.provider_fax);
      }

      if(val.provider_address){
        let addressGroup = this.newPractitionerForm.get('address')
        addressGroup.get('line1').setValue(val.provider_address.line1)
        addressGroup.get('line2').setValue(val.provider_address.line2)
        addressGroup.get('city').setValue(val.provider_address.city)
        addressGroup.get('state').setValue(val.provider_address.state)
        addressGroup.get('zip').setValue(val.provider_address.zip)
        addressGroup.get('country').setValue(val.provider_address.country)
      }
      if(val.text) {
        this.newPractitionerForm.get('name').setValue( val.text);
      }
    });


    this.newPractitionerForm = new FormGroup({
      identifier: new FormControl([]),
      name: new FormControl(null, Validators.required),
      profession: new FormControl(null, Validators.required),
      phone: new FormControl(null, Validators.pattern('[- +()0-9]+')),
      fax: new FormControl(null, Validators.pattern('[- +()0-9]+')),
      email: new FormControl(null, Validators.email),
      address: new FormGroup({
        line1: new FormControl(null),
        line2: new FormControl(null),
        city: new FormControl(null),
        state: new FormControl(null),
        zip: new FormControl(null),
        country: new FormControl(null),
      })
    })
  }
}
