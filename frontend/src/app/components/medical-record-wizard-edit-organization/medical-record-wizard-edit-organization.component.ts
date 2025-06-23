import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NlmTypeaheadComponent } from '../nlm-typeahead/nlm-typeahead.component';
import { HighlightModule } from 'ngx-highlightjs';
import { NgbActiveModal, NgbDatepickerModule, NgbNavModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { FhirDatatableModule } from '../fhir-datatable/fhir-datatable.module';
import { FastenApiService } from '../../services/fasten-api.service';
import { OrganizationModel } from 'src/lib/public-api';
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
  selector: 'app-medical-record-wizard-edit-organization',
  templateUrl: './medical-record-wizard-edit-organization.component.html',
  styleUrls: ['./medical-record-wizard-edit-organization.component.scss']
})
export class MedicalRecordWizardEditOrganizationComponent implements OnInit {
  @Input() debugMode: boolean = false;
  @Input() organization: OrganizationModel;
  loading: boolean = false

  //create tab options
  organizationForm: FormGroup
  organizationTypeaheadForm: FormGroup

  constructor(
    public activeModal: NgbActiveModal,
  ) { }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.organizationTypeaheadForm = new FormGroup({
      data: new FormControl(null, Validators.required),
    })
    this.organizationTypeaheadForm.valueChanges.subscribe(form => {
      let val = form.data

      if (val == null) {
        //reset the dependant fields (user cleared the text box)
        this.organizationForm.get('type').setValue(null)
        this.organizationForm.get('identifier').setValue(null);
        this.organizationForm.get('phone').setValue(null);
        this.organizationForm.get('fax').setValue(null);
        let addressGroup = this.organizationForm.get('address')
        addressGroup.get('line1').setValue(null)
        addressGroup.get('line2').setValue(null)
        addressGroup.get('city').setValue(null)
        addressGroup.get('state').setValue(null)
        addressGroup.get('zip').setValue(null)
        addressGroup.get('country').setValue(null)
        this.organizationForm.get('name').setValue(null);
        return
      }

      if (val.provider_type) {
        this.organizationForm.get('type').setValue(val.provider_type)
      }
      if (val.identifier) {
        this.organizationForm.get('identifier').setValue(val.identifier)
      }
      if (val.provider_phone) {
        this.organizationForm.get('phone').setValue(val.provider_phone)
      }
      if (val.provider_fax) {
        this.organizationForm.get('fax').setValue(val.provider_fax)
      }
      if (val.provider_address) {
        let addressGroup = this.organizationForm.get('address')
        addressGroup.get('line1').setValue(val.provider_address.line1)
        addressGroup.get('line2').setValue(val.provider_address.line2)
        addressGroup.get('city').setValue(val.provider_address.city)
        addressGroup.get('state').setValue(val.provider_address.state)
        addressGroup.get('zip').setValue(val.provider_address.zip)
        addressGroup.get('country').setValue(val.provider_address.country)
      }
      if (val.text) {
        this.organizationForm.get('name').setValue(val.text)
      }
    });

    this.organizationForm = new FormGroup({
      identifier: new FormControl([]),
      name: new FormControl(null, Validators.required),
      type: new FormControl(null, Validators.required),
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

    if (this.organization) {
      this.populateForm(this.organization)
    }
  }

  private populateForm(organization: OrganizationModel) {
    this.organizationTypeaheadForm.get('data').setValue({ text: organization.name })
    this.organizationForm.get('name').setValue(organization.name);
    this.organizationForm.get('identifier').setValue(organization.identifier?.[0])
    this.organizationForm.get('type').setValue(organization.type?.[0])

    let addressGroup = this.organizationForm.get('address')
    addressGroup.get('line1').setValue(organization.addresses?.[0].line?.[0])
    addressGroup.get('line2').setValue(organization.addresses?.[0].line?.[1])
    addressGroup.get('city').setValue(organization.addresses?.[0].city)
    addressGroup.get('state').setValue(organization.addresses?.[0].state)
    addressGroup.get('zip').setValue(organization.addresses?.[0].postalCode)
    addressGroup.get('country').setValue(organization.addresses?.[0].country)

    let organizationForm = organization.telecom.find((telecom) => telecom.system == 'phone')
    if (organizationForm) {
      this.organizationForm.get('phone').setValue(organizationForm.value)
    }

    let organizationFax = organization.telecom.find((telecom) => telecom.system == 'fax')
    if (organizationFax) {
      this.organizationForm.get('fax').setValue(organizationFax.value)
    }

    let organizationEmail = organization.telecom.find((telecom) => telecom.system == 'email')
    if (organizationEmail) {
      this.organizationForm.get('email').setValue(organizationEmail.value)
    }
  }

  get submitEnabled() {
    return this.organizationForm.valid
  }

  submit() {
    let organization = this.organization

    let address = new AddressModel(null)
    address.city = this.organizationForm.get('address').get('city').value
    address.line = []
    if (this.organizationForm.get('address').get('line1').value) {
      address.line.push(this.organizationForm.get('address').get('line1').value)
    }
    if (this.organizationForm.get('address').get('line2').value) {
      address.line.push(this.organizationForm.get('address').get('line2').value)
    }
    address.state = this.organizationForm.get('address').get('state').value
    address.country = this.organizationForm.get('address').get('country').value
    address.postalCode = this.organizationForm.get('address').get('zip').value
    organization.addresses = [address]

    if (this.organizationForm.get('identifier')) {
      organization.identifier = [this.organizationForm.get('identifier').value]
    }

    if (this.organizationForm.get('phone').value) {
      let phone = {
        system: 'phone',
        value: this.organizationForm.get('phone').value,
        use: 'work'
      }
      let existingPhoneIndex = organization.telecom.findIndex((telecom) => telecom.system == 'phone')
      if (existingPhoneIndex != -1) {
        organization.telecom[existingPhoneIndex] = phone
      } else {
        organization.telecom.push(phone)
      }
    }
    if (this.organizationForm.get('fax').value) {
      let fax = {
        system: 'fax',
        value: this.organizationForm.get('fax').value,
        use: 'work'
      }
      let existingFaxIndex = organization.telecom.findIndex((telecom) => telecom.system == 'fax')
      if (existingFaxIndex != -1) {
        organization.telecom[existingFaxIndex] = fax
      } else {
        organization.telecom.push(fax)
      }
    }
    if (this.organizationForm.get('email').value) {
      let email = {
        system: 'email',
        value: this.organizationForm.get('email').value,
        use: 'work'
      }
      let existingEmailIndex = organization.telecom.findIndex((telecom) => telecom.system == 'email')
      if (existingEmailIndex != -1) {
        organization.telecom[existingEmailIndex] = email
      } else {
        organization.telecom.push(email)
      }
    }

    if (this.organizationForm.get('type').value) {
      organization.type = [this.organizationForm.get('type').value]
    }
    if (this.organizationForm.get('name').value) {
      organization.sort_title = this.organizationForm.get('name').value
      organization.name = this.organizationForm.get('name').value
    }

    this.activeModal.close(organization)
  }
}
