import {Component, Input, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {NlmTypeaheadComponent} from '../nlm-typeahead/nlm-typeahead.component';
import {HighlightModule} from 'ngx-highlightjs';
import {NgbActiveModal, NgbNavLink, NgbNavModule, NgbTooltipModule} from '@ng-bootstrap/ng-bootstrap';
import {FhirDatatableModule} from '../fhir-datatable/fhir-datatable.module';

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
    FhirDatatableModule
  ],
  selector: 'app-medical-record-wizard-add-organization',
  templateUrl: './medical-record-wizard-add-organization.component.html',
  styleUrls: ['./medical-record-wizard-add-organization.component.scss']
})
export class MedicalRecordWizardAddOrganizationComponent implements OnInit {
  @Input() debugMode: boolean = false;

  activeId: string = 'existing'

  newOrganizationTypeaheadForm: FormGroup
  newOrganizationForm: FormGroup //ResourceCreateOrganization

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
    this.resetOrganizationForm()
  }

  submit() {
    this.newOrganizationForm.markAllAsTouched()
    this.newOrganizationTypeaheadForm.markAllAsTouched()
    if(this.newOrganizationForm.valid){
      this.activeModal.close(this.newOrganizationForm.getRawValue());
    }
  }

  private resetOrganizationForm(){
    this.newOrganizationTypeaheadForm = new FormGroup({
      data: new FormControl(null, Validators.required),
    })
    this.newOrganizationTypeaheadForm.valueChanges.subscribe(form => {
      console.log("CHANGE Organization IN MODAL", form)
      let val = form.data
      if(val.provider_type) {
        this.newOrganizationForm.get('type').setValue(val.provider_type)
      }
      if(val.identifier){
        this.newOrganizationForm.get('identifier').setValue(val.identifier)
      }
      if(val.provider_phone){
        this.newOrganizationForm.get('phone').setValue(val.provider_phone)
      }
      if(val.provider_fax){
        this.newOrganizationForm.get('fax').setValue(val.provider_fax)
      }
      if(val.provider_address){
        let addressGroup = this.newOrganizationForm.get('address')
        addressGroup.get('line1').setValue(val.provider_address.line1)
        addressGroup.get('line2').setValue(val.provider_address.line2)
        addressGroup.get('city').setValue(val.provider_address.city)
        addressGroup.get('state').setValue(val.provider_address.state)
        addressGroup.get('zip').setValue(val.provider_address.zip)
        addressGroup.get('country').setValue(val.provider_address.country)
      }
      if(val.text) {
        this.newOrganizationForm.get('name').setValue(val.text)
      }
    });

    this.newOrganizationForm = new FormGroup({
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

  }
}
