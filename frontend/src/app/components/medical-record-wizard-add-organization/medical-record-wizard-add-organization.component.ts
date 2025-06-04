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
import {OrganizationModel} from '../../../lib/models/resources/organization-model';
import {CodingModel} from '../../../lib/models/datatypes/coding-model';
import {AddressModel} from '../../../lib/models/datatypes/address-model';
import {CodableConceptModel} from '../../../lib/models/datatypes/codable-concept-model';
import {uuidV4} from '../../../lib/utils/uuid';
import {fhirModelFactory} from '../../../lib/models/factory';
import {ResourceFhir} from '../../models/fasten/resource_fhir';
import {ResourceType} from '../../../lib/models/constants';

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
  @Input() disabledResourceIds: string[] = [];

  activeId: string = 'find'

  //create tab options
  newOrganizationTypeaheadForm: FormGroup
  newOrganizationForm: FormGroup //ResourceCreateOrganization

  //find tab options
  selectedOrganization: {source_resource_id: string,source_resource_type: ResourceType, resource: ResourceFhir} = null
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
  selectionChanged(event) {
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
          data: this.organizationFormToDisplayModel(this.newOrganizationForm)
        });
      }
    } else if(this.activeId == 'find'){
      if(this.selectedOrganization != null){
        this.activeModal.close({
          action: this.activeId,
          data: fhirModelFactory(this.selectedOrganization.source_resource_type, this.selectedOrganization.resource)
        });
      }
    }
  }

  private organizationFormToDisplayModel(form: FormGroup): OrganizationModel {
    let address = new AddressModel(null)
    address.city = form.get('address').get('city').value
    address.line = []
    if (form.get('address').get('line1').value) {
      address.line.push(form.get('address').get('line1').value)
    }
    if (form.get('address').get('line2').value) {
      address.line.push(form.get('address').get('line2').value)
    }
    address.state = form.get('address').get('state').value
    address.country = form.get('address').get('country').value
    address.postalCode = form.get('address').get('zip').value

    let model = new OrganizationModel({})
    model.source_resource_id = form.get('id').value
    model.identifier = form.get('identifier').value
    model.name = form.get('name').value
    model.addresses = [address]
    model.telecom = []
    model.type = []
    if (form.get('phone').value) {
      model.telecom.push({
        system: 'phone',
        value: form.get('phone').value,
        use: 'work'
      })
    }
    if(form.get('fax').value) {
      model.telecom.push({
        system: 'fax',
        value: form.get('fax').value,
        use: 'work'
      })
    }
    if(form.get('email').value) {
      model.telecom.push({
        system: 'email',
        value: form.get('email').value,
        use: 'work'
      })
    }
    if(form.get('type').value) {
      let codableConcept = new CodableConceptModel({})
      codableConcept.coding = form.get('type').value.identifier
      codableConcept.text = form.get('type').value.text
      model.type.push(codableConcept)
    }

    if(!model.source_resource_id){
      console.warn("No source_resource_id set for Organization, generating one")
      model.source_resource_id = uuidV4();
    }

    return model
  }

  private resetOrganizationForm(){
    this.newOrganizationTypeaheadForm = new FormGroup({
      data: new FormControl(null, Validators.required),
    })
    this.newOrganizationTypeaheadForm.valueChanges.subscribe(form => {
      let val = form.data

      if(val == null){
        //reset the dependant fields (user cleared the text box)
        this.newOrganizationForm.get('id').setValue(null)
        this.newOrganizationForm.get('type').setValue(null)
        this.newOrganizationForm.get('identifier').setValue(null);
        this.newOrganizationForm.get('phone').setValue(null);
        this.newOrganizationForm.get('fax').setValue(null);
        let addressGroup = this.newOrganizationForm.get('address')
        addressGroup.get('line1').setValue(null)
        addressGroup.get('line2').setValue(null)
        addressGroup.get('city').setValue(null)
        addressGroup.get('state').setValue(null)
        addressGroup.get('zip').setValue(null)
        addressGroup.get('country').setValue(null)
        this.newOrganizationForm.get('name').setValue(null);
        return
      }

      if(val.id){
        this.newOrganizationForm.get('id').setValue(val.id)
      }
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
      id: new FormControl(null),
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
