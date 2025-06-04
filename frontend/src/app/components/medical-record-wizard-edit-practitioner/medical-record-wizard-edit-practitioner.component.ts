import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NlmTypeaheadComponent } from '../nlm-typeahead/nlm-typeahead.component';
import { HighlightModule } from 'ngx-highlightjs';
import { NgbActiveModal, NgbDatepickerModule, NgbNavModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { FhirDatatableModule } from '../fhir-datatable/fhir-datatable.module';
import { FastenApiService } from '../../services/fasten-api.service';
import { EncounterModel } from '../../../lib/models/resources/encounter-model';
import { PractitionerModel } from 'src/lib/public-api';
import { zip } from 'rxjs';
import {parseFullName}  from 'parse-full-name'
import { AddressModel } from 'src/lib/models/datatypes/address-model';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NlmTypeaheadComponent,
    HighlightModule,
    NgbTooltipModule,
    NgbNavModule,
    FhirDatatableModule,
    NgbDatepickerModule
  ],
  selector: 'app-medical-record-wizard-edit-practitioner',
  templateUrl: './medical-record-wizard-edit-practitioner.component.html',
  styleUrls: ['./medical-record-wizard-edit-practitioner.component.scss']
})
export class MedicalRecordWizardEditPractitionerComponent implements OnInit {
  @Input() debugMode: boolean = false;
  @Input() practitioner: PractitionerModel;
  loading: boolean = false

  //create tab options
  practitionerForm: FormGroup
  practitionerTypeaheadForm: FormGroup

  constructor(
    public activeModal: NgbActiveModal,
  ) { }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.practitionerTypeaheadForm = new FormGroup({
      data: new FormControl(null, Validators.required),
    })
    this.practitionerTypeaheadForm.valueChanges.subscribe(form => {
      let val = form.data
      if (val == null) {
        //reset the dependant fields (user cleared the text box)
        this.practitionerForm.get('profession').setValue(null)
        this.practitionerForm.get('identifier').setValue(null);
        this.practitionerForm.get('phone').setValue(null);
        this.practitionerForm.get('fax').setValue(null);
        let addressGroup = this.practitionerForm.get('address')
        addressGroup.get('line1').setValue(null)
        addressGroup.get('line2').setValue(null)
        addressGroup.get('city').setValue(null)
        addressGroup.get('state').setValue(null)
        addressGroup.get('zip').setValue(null)
        addressGroup.get('country').setValue(null)
        this.practitionerForm.get('name').setValue(null);
        return
      }

      if (val.provider_type) {
        this.practitionerForm.get('profession').setValue(val.provider_type)
      }
      if (val.identifier) {
        this.practitionerForm.get('identifier').setValue(val.identifier);
      }
      if (form.data.provider_phone) {
        this.practitionerForm.get('phone').setValue(val.provider_phone);
      }
      if (val.provider_fax) {
        this.practitionerForm.get('fax').setValue(val.provider_fax);
      }

      if (val.provider_address) {
        let addressGroup = this.practitionerForm.get('address')
        addressGroup.get('line1').setValue(val.provider_address.line1)
        addressGroup.get('line2').setValue(val.provider_address.line2)
        addressGroup.get('city').setValue(val.provider_address.city)
        addressGroup.get('state').setValue(val.provider_address.state)
        addressGroup.get('zip').setValue(val.provider_address.zip)
        addressGroup.get('country').setValue(val.provider_address.country)
      }
      if (val.text) {
        this.practitionerForm.get('name').setValue(val.text);
      }
    });


    this.practitionerForm = new FormGroup({
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

    if (this.practitioner) {
      this.populateForm(this.practitioner)
    }
  }

  private populateForm(practitioner: PractitionerModel): void {
    this.practitionerTypeaheadForm.get('data').setValue({ text: practitioner.name?.[0].displayName })

    this.practitionerForm.get('name').setValue(practitioner.name?.[0].displayName)
    this.practitionerForm.get('identifier').setValue(practitioner.identifier?.[0])

    this.practitionerForm.get('profession').setValue(practitioner.qualification?.[0].display)

    let addressGroup = this.practitionerForm.get('address')
    addressGroup.get('line1').setValue(practitioner.address?.[0].line?.[0])
    addressGroup.get('line2').setValue(practitioner.address?.[0].line?.[1])
    addressGroup.get('city').setValue(practitioner.address?.[0].city)
    addressGroup.get('state').setValue(practitioner.address?.[0].state)
    addressGroup.get('zip').setValue(practitioner.address?.[0].postalCode)
    addressGroup.get('country').setValue(practitioner.address?.[0].country)

    let practitionerPhone = practitioner.telecom.find((telecom) => telecom.system == 'phone')
    if (practitionerPhone) {
      this.practitionerForm.get('phone').setValue(practitionerPhone.value)
    }

    let practitionerFax = practitioner.telecom.find((telecom) => telecom.system == 'fax')
    if (practitionerFax) {
      this.practitionerForm.get('fax').setValue(practitionerFax.value)
    }

    let practitionerEmail = practitioner.telecom.find((telecom) => telecom.system == 'email')
    if (practitionerEmail) {
      this.practitionerForm.get('email').setValue(practitionerEmail.value)
    }
  }

  get submitEnabled() {
    return true
  }

  submit() {
    let practitioner = this.practitioner

    let address = new AddressModel(null)
    address.city = this.practitionerForm.get('address').get('city').value
    address.line = []
    if (this.practitionerForm.get('address').get('line1').value) {
      address.line.push(this.practitionerForm.get('address').get('line1').value)
    }
    if (this.practitionerForm.get('address').get('line2').value) {
      address.line.push(this.practitionerForm.get('address').get('line2').value)
    }
    address.state = this.practitionerForm.get('address').get('state').value
    address.country = this.practitionerForm.get('address').get('country').value
    address.postalCode = this.practitionerForm.get('address').get('zip').value
    practitioner.address = [address]
    
    if (this.practitionerForm.get('identifier')) {
      practitioner.identifier = [this.practitionerForm.get('identifier').value]
    }
    
    if (this.practitionerForm.get('phone').value) {
      let phone = {
        system: 'phone',
        value: this.practitionerForm.get('phone').value,
        use: 'work'
      }
      let existingPhoneIndex = practitioner.telecom.findIndex((telecom) => telecom.system == 'phone')
      if (existingPhoneIndex != -1) {
        practitioner.telecom[existingPhoneIndex] = phone
      } else {
        practitioner.telecom.push(phone)
      }
    }
    if (this.practitionerForm.get('fax').value) {
      let fax = {
        system: 'fax',
        value: this.practitionerForm.get('fax').value,
        use: 'work'
      }
      let existingFaxIndex = practitioner.telecom.findIndex((telecom) => telecom.system == 'fax')
      if (existingFaxIndex != -1) {
        practitioner.telecom[existingFaxIndex] = fax
      } else {
        practitioner.telecom.push(fax)
      }
    }
    if (this.practitionerForm.get('email').value) {
      let email = {
        system: 'email',
        value: this.practitionerForm.get('email').value,
        use: 'work'
      }
      let existingEmailIndex = practitioner.telecom.findIndex((telecom) => telecom.system == 'email')
      if (existingEmailIndex != -1) {
        practitioner.telecom[existingEmailIndex] = email
      } else {
        practitioner.telecom.push(email)
      }
    }

    if (this.practitionerForm.get('profession').value) {
      practitioner.qualification = [this.practitionerForm.get('profession').value]
    }
    if (this.practitionerForm.get('name').value) {
      practitioner.sort_title = this.practitionerForm.get('name').value
      let nameParts = parseFullName(this.practitionerForm.get('name').value)
      practitioner.name = [{
        givenName: nameParts.first,
        familyName: nameParts.last,
        suffix: nameParts.suffix,
        textName: this.practitionerForm.get('name').value,
        use: 'official',
        displayName: this.practitionerForm.get('name').value,
      }]
    }
    
    this.activeModal.close(practitioner) 
  }
}
