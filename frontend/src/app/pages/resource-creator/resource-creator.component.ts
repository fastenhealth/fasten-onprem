import {Component, Input, OnInit} from '@angular/core';
import {AbstractControl, FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  ResourceCreateAttachment,
  ResourceCreateOrganization,
  ResourceCreatePractitioner,
} from '../../models/fasten/resource_create';
import {uuidV4} from '../../../lib/utils/uuid';
import {NlmSearchResults} from '../../services/nlm-clinical-table-search.service';
import {GenerateR4Bundle} from './resource-creator.utilities';
import {FastenApiService} from '../../services/fasten-api.service';
import {Router} from '@angular/router';

export interface MedicationModel {
  data: {},
  status: string,
  dosage: string,
  started: null,
  stopped: null,
  whystopped: string,
  resupply: string
}

export enum ContactType {
  ContactTypeSearch = 'search',
  ContactTypeManual = 'manual',
}

@Component({
  selector: 'app-resource-creator',
  templateUrl: './resource-creator.component.html',
  styleUrls: ['./resource-creator.component.scss']
})
export class ResourceCreatorComponent implements OnInit {
  debugMode = false;
  collapsePanel: {[name: string]: boolean} = {}


  @Input() form!: FormGroup;
  get isValid() { return true; }

  // model: any = {
  //   condition: {
  //     data: {},
  //     status: null,
  //     started: null,
  //     stopped: null,
  //     description: null,
  //   },
  //   medication: []
  // }


  constructor(private router: Router, private modalService: NgbModal, private fastenApi: FastenApiService) { }

  ngOnInit(): void {


    //https://stackoverflow.com/questions/52038071/creating-nested-form-groups-using-angular-reactive-forms
    //https://www.danywalls.com/creating-dynamic-forms-in-angular-a-step-by-step-guide
    //https://www.telerik.com/blogs/angular-basics-creating-dynamic-forms-using-formarray-angular
    //https://angular.io/guide/reactive-forms#creating-dynamic-forms
    //https://angular.io/guide/dynamic-form
    this.form = new FormGroup({
      condition: new FormGroup({
        data: new FormControl<NlmSearchResults>(null, Validators.required),
        status: new FormControl(null, Validators.required),
        started: new FormControl(null, Validators.required),
        stopped: new FormControl(null),
        description: new FormControl(null),
      }),

      medications: new FormArray([]),
      procedures: new FormArray([]),
      practitioners: new FormArray([]),
      organizations: new FormArray([]),
      attachments: new FormArray([]),
    });

    this.resetOrganizationForm()
    // this.resetPractitionerForm()
  }

  get medications(): FormArray {
    return this.form.controls["medications"] as FormArray;
  }
  addMedication(){
    const medicationGroup = new FormGroup({
      data: new FormControl<NlmSearchResults>(null, Validators.required),
      status: new FormControl(null, Validators.required),
      dosage: new FormControl({
        value: '', disabled: true
      }),
      started: new FormControl(null, Validators.required),
      stopped: new FormControl(null),
      whystopped: new FormControl(null),
      requester: new FormControl(null, Validators.required),
      instructions: new FormControl(null),
      attachments: new FormControl([]),
    });

    medicationGroup.get("data").valueChanges.subscribe(val => {
      medicationGroup.get("dosage").enable();
      //TODO: find a way to create dependant dosage information based on medication data.
    });

    this.medications.push(medicationGroup);
  }
  deleteMedication(index: number) {
    this.medications.removeAt(index);
  }


  get procedures(): FormArray {
    return this.form.controls["procedures"] as FormArray;
  }
  addProcedure(){
    const procedureGroup = new FormGroup({
      data: new FormControl<NlmSearchResults>(null, Validators.required),
      whendone: new FormControl(null, Validators.required),
      performer: new FormControl(null),
      location: new FormControl(null),
      comment: new FormControl(''),
      attachments: new FormControl([]),
    });

    this.procedures.push(procedureGroup);
  }
  deleteProcedure(index: number) {
    this.procedures.removeAt(index);
  }


  get practitioners(): FormArray {
    return this.form.controls["practitioners"] as FormArray;
  }

  addPractitioner(practitioner: ResourceCreatePractitioner){
    const practitionerGroup = new FormGroup({
      id: new FormControl(practitioner.id, Validators.required),
      identifier: new FormControl(practitioner.identifier),
      profession: new FormControl(practitioner.profession, Validators.required),
      name: new FormControl(practitioner.name, Validators.required),
      phone: new FormControl(practitioner.phone, Validators.pattern('[- +()0-9]+')),
      fax: new FormControl(practitioner.fax, Validators.pattern('[- +()0-9]+')),
      email: new FormControl(practitioner.email, Validators.email),
      address: new FormGroup({
        line1: new FormControl(practitioner.address.line1),
        line2: new FormControl(practitioner.address.line2),
        city: new FormControl(practitioner.address.city),
        state: new FormControl(practitioner.address.state),
        zip: new FormControl(practitioner.address.zip),
        country: new FormControl(practitioner.address.country),
      }),
    });

    this.practitioners.push(practitionerGroup);
  }

  deletePractitioner(index: number) {
    this.practitioners.removeAt(index);
  }


  get organizations(): FormArray {
    return this.form.controls["organizations"] as FormArray;
  }

  addOrganization(organization: ResourceCreateOrganization){
    const organizationGroup = new FormGroup({
      id: new FormControl(organization.id, Validators.required),
      identifier: new FormControl(organization.identifier),
      name: new FormControl(organization.name, Validators.required),
      type: new FormControl(organization.type),
      phone: new FormControl(organization.phone, Validators.pattern('[- +()0-9]+')),
      fax: new FormControl(organization.fax, Validators.pattern('[- +()0-9]+')),
      email: new FormControl(organization.email, Validators.email),
      address: new FormControl(organization.address),
    });

    this.organizations.push(organizationGroup);
  }
  deleteOrganization(index: number) {
    this.organizations.removeAt(index);
  }

  get attachments(): FormArray {
    return this.form.controls["attachments"] as FormArray;
  }

  addAttachment(attachment: ResourceCreateAttachment){
    const attachmentGroup = new FormGroup({
      id: new FormControl(attachment.id, Validators.required),
      name: new FormControl(attachment.name, Validators.required),
      category: new FormControl(attachment.category, Validators.required),
      file_type: new FormControl(attachment.file_type, Validators.required),
      file_name: new FormControl(attachment.file_name, Validators.required),
      file_content: new FormControl(attachment.file_content, Validators.required),
      file_size: new FormControl(attachment.file_size, Validators.required),
    });

    this.attachments.push(attachmentGroup);
  }
  deleteAttachment(index: number) {
    this.attachments.removeAt(index);
  }


  onSubmit() {
    console.log(this.form.getRawValue())
    this.form.markAllAsTouched()
    if (this.form.valid) {
      console.log('form submitted');

      let bundle = GenerateR4Bundle(this.form.getRawValue());

      let bundleJsonStr = JSON.stringify(bundle);
      let bundleBlob = new Blob([bundleJsonStr], { type: 'application/json' });
      let bundleFile = new File([ bundleBlob ], 'bundle.json');
      this.fastenApi.createManualSource(bundleFile).subscribe((resp) => {
        console.log(resp)
        this.router.navigate(['/medical-history'])
      })

    }


  }

  //Modal Helpers
  newPractitionerTypeaheadForm: FormGroup
  newPractitionerForm: FormGroup //ResourceCreatePractitioner

  newOrganizationTypeaheadForm: FormGroup
  newOrganizationForm: FormGroup //ResourceCreateOrganization

  newAttachmentForm: FormGroup

  openPractitionerModal(content, formGroup?: AbstractControl, controlName?: string) {
    this.resetPractitionerForm()
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-practitioner',
      beforeDismiss: () => {
        console.log("validate Practitioner form")
        this.newPractitionerForm.markAllAsTouched()
        this.newPractitionerTypeaheadForm.markAllAsTouched()
        return this.newPractitionerForm.valid
      },
    }).result.then(
      () => {
        console.log('Closed without saving');
      },
      () => {
        console.log('Closing, saving form');
        //add this to the list of organization
        let result = this.newPractitionerForm.getRawValue()
        result.id = uuidV4();
        this.addPractitioner(result);
        if(formGroup && controlName){
          //set this practitioner to the current select box
          formGroup.get(controlName).setValue(result.id);
        }
      },
    );
  }

  openOrganizationModal(content, formGroup?: AbstractControl, controlName?: string) {
    this.resetOrganizationForm()

    this.modalService.open(content, {
      ariaLabelledBy: 'modal-organization',
      beforeDismiss: () => {
        console.log("validate Organization form")
        this.newOrganizationForm.markAllAsTouched()
        this.newOrganizationTypeaheadForm.markAllAsTouched()
        return this.newOrganizationForm.valid
      },
    }).result.then(
      () => {
        console.log('Closed without saving');
      },
      () => {
        console.log('Closing, saving form');
        //add this to the list of organization
        let result = this.newOrganizationForm.getRawValue()
        result.id = uuidV4();
        this.addOrganization(result);
        if(formGroup && controlName){
          //set this practitioner to the current select box
          formGroup.get(controlName).setValue(result.id);
        }
      },
    );
  }

  openAttachmentModal(content, formGroup?: AbstractControl, controlName?: string) {
    this.resetAttachmentForm()

    this.modalService.open(content, {
      ariaLabelledBy: 'modal-attachment',
      beforeDismiss: () => {
        console.log("validate Attachment form")
        this.newAttachmentForm.markAllAsTouched()
        return this.newAttachmentForm.valid
      },
    }).result.then(
      () => {
        console.log('Closed without saving');
      },
      () => {
        console.log('Closing, saving form');
        //add this to the list of organization
        let result = this.newAttachmentForm.getRawValue()
        result.id = uuidV4();
        this.addAttachment(result);

        if(formGroup && controlName){

          //add this attachment id to the current FormArray
          let controlArrayVal = formGroup.get(controlName).getRawValue();
          controlArrayVal.push(result.id)
          formGroup.get(controlName).setValue(controlArrayVal);
        }
      },
    );
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
