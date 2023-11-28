import {Component, Input, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {NlmTypeaheadComponent} from '../nlm-typeahead/nlm-typeahead.component';
import {HighlightModule} from 'ngx-highlightjs';
import {NgbActiveModal, NgbNavLink, NgbNavModule, NgbTooltipModule} from '@ng-bootstrap/ng-bootstrap';
import {FhirDatatableModule} from '../fhir-datatable/fhir-datatable.module';
import {FastenDisplayModel} from '../../../lib/models/fasten/fasten-display-model';
import {FastenApiService} from '../../services/fasten-api.service';
import {ResponseWrapper} from '../../models/response-wrapper';

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

  activeId: string = 'find'

  //create tab options
  newOrganizationTypeaheadForm: FormGroup
  newOrganizationForm: FormGroup //ResourceCreateOrganization

  //find tab options
  selectedOrganization: FastenDisplayModel
  totalOrganizations: number = 0
  constructor(
    public activeModal: NgbActiveModal,
    private fastenApi: FastenApiService,
  ) { }

  ngOnInit(): void {
    this.resetOrganizationForm()

    //get a count of all the known organizations
    this.fastenApi.queryResources({
      "select": [],
      "from": "Organization",
      "where": {},
      "aggregations": {
        "count_by": {"field": "*"}
      }
    }).subscribe((resp: ResponseWrapper) => {
      this.totalOrganizations = resp.data?.[0].value
    })
  }
  changeTab(id: string) {
    if(this.activeId != id){
      this.activeId = id
      this.resetOrganizationForm()
      this.selectedOrganization = null
    }
  }
  selectionChanged(event: FastenDisplayModel) {
    console.log("SELECTION CHANGED", event)
    this.selectedOrganization = event
  }
  get submitEnabled() {
    return (this.activeId == 'create' && this.newOrganizationForm.valid) ||
      (this.activeId == 'find' && this.selectedOrganization != null)
  }

  submit() {
    if(this.activeId == 'create'){
      this.newOrganizationForm.markAllAsTouched()
      if(this.newOrganizationForm.valid){
        this.activeModal.close({
          action: this.activeId,
          data: this.newOrganizationForm.getRawValue()
        });
      }
    } else if(this.activeId == 'find'){
      if(this.selectedOrganization != null){
        this.activeModal.close({
          action: this.activeId,
          data: this.selectedOrganization
        });
      }
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
