import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal, NgbDatepickerModule, NgbNavModule, NgbTooltipModule, NgbTypeaheadModule} from '@ng-bootstrap/ng-bootstrap';
import {CommonModule} from '@angular/common';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {NlmTypeaheadComponent} from '../nlm-typeahead/nlm-typeahead.component';
import {HighlightModule} from 'ngx-highlightjs';
import {FhirDatatableModule} from '../fhir-datatable/fhir-datatable.module';
import {ResourceType} from '../../../lib/models/constants';
import {ResourceFhir} from '../../models/fasten/resource_fhir';
import {FastenApiService} from '../../services/fasten-api.service';
import {ResponseWrapper} from '../../models/response-wrapper';
import {fhirModelFactory} from '../../../lib/models/factory';
import {OrganizationModel} from '../../../lib/models/resources/organization-model';
import {AddressModel} from '../../../lib/models/datatypes/address-model';
import {CodableConceptModel} from '../../../lib/models/datatypes/codable-concept-model';
import {uuidV4} from '../../../lib/utils/uuid';
import {PractitionerModel} from '../../../lib/models/resources/practitioner-model';
import {parseFullName}  from 'parse-full-name'

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
  selector: 'app-medical-record-wizard-add-practitioner',
  templateUrl: './medical-record-wizard-add-practitioner.component.html',
  styleUrls: ['./medical-record-wizard-add-practitioner.component.scss']
})
export class MedicalRecordWizardAddPractitionerComponent implements OnInit {
  @Input() debugMode: boolean = false;
  @Input() disabledResourceIds: string[] = [];

  activeId: string = 'find'

  newPractitionerTypeaheadForm: FormGroup
  newPractitionerForm: FormGroup //ResourceCreatePractitioner

  //find tab options
  selectedPractitioner: {source_resource_id: string,source_resource_type: ResourceType, resource: ResourceFhir} = null
  totalPractitioners: number = 0

  constructor(
    public activeModal: NgbActiveModal,
    private fastenApi: FastenApiService,
  ) { }

  ngOnInit(): void {
    this.resetPractitionerForm()

    //get a count of all the known practitioners
    this.fastenApi.queryResources({
      "select": [],
      "from": "Practitioner",
      "where": {},
      "aggregations": {
        "count_by": {"field": "*"}
      }
    }).subscribe((resp: ResponseWrapper) => {
      this.totalPractitioners = resp.data?.[0].value
    })
  }
  changeTab(id: string) {
    if(this.activeId != id){
      this.activeId = id
      this.resetPractitionerForm()
      this.selectedPractitioner = null
    }
  }
  selectionChanged(event) {
    this.selectedPractitioner = event
  }
  get submitEnabled() {
    return (this.activeId == 'create' && this.newPractitionerForm.valid) ||
      (this.activeId == 'find' && this.selectedPractitioner != null)
  }

  submit() {
    if(this.activeId == 'create'){
      this.newPractitionerForm.markAllAsTouched()
      if(this.newPractitionerForm.valid){
        this.activeModal.close({
          action: this.activeId,
          data: this.practitionerFormToDisplayModel(this.newPractitionerForm)
        });
      }
    } else if(this.activeId == 'find'){
      if(this.selectedPractitioner != null){
        this.activeModal.close({
          action: this.activeId,
          data: fhirModelFactory(this.selectedPractitioner.source_resource_type, this.selectedPractitioner.resource)
        });
      }
    }
  }

  private practitionerFormToDisplayModel(form: FormGroup): PractitionerModel {
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

    let model = new PractitionerModel({})
    model.source_resource_id = form.get('id').value
    model.identifier = form.get('identifier').value
    model.name = []
    model.address = [address]
    model.telecom = []
    model.qualification = []
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
    if(form.get('profession').value) {
      model.qualification = form.get('profession').value.identifier
    }
    if(form.get('name').value) {
      let nameParts = parseFullName(form.get('name').value)
      model.name.push({
        givenName: nameParts.first,
        familyName: nameParts.last,
        suffix: nameParts.suffix,
        textName: form.get('name').value,
        use: 'official',
        displayName: form.get('name').value,
      })
    }

    if(!model.source_resource_id){
      console.warn("No source_resource_id set for Organization, generating one")
      model.source_resource_id = uuidV4();
    }

    return model
  }

  private resetPractitionerForm(){
    this.newPractitionerTypeaheadForm = new FormGroup({
      data: new FormControl(null, Validators.required),
    })
    this.newPractitionerTypeaheadForm.valueChanges.subscribe(form => {
      let val = form.data
      if(val == null){
        //reset the dependant fields (user cleared the text box)
        this.newPractitionerForm.get('id').setValue(null)
        this.newPractitionerForm.get('profession').setValue(null)
        this.newPractitionerForm.get('identifier').setValue(null);
        this.newPractitionerForm.get('phone').setValue(null);
        this.newPractitionerForm.get('fax').setValue(null);
        let addressGroup = this.newPractitionerForm.get('address')
        addressGroup.get('line1').setValue(null)
        addressGroup.get('line2').setValue(null)
        addressGroup.get('city').setValue(null)
        addressGroup.get('state').setValue(null)
        addressGroup.get('zip').setValue(null)
        addressGroup.get('country').setValue(null)
        this.newPractitionerForm.get('name').setValue(null);
        return
      }


      if(val.id){
        this.newPractitionerForm.get('id').setValue(val.id)
      }
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
      id: new FormControl(null),
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
