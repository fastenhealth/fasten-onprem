import {Component, Input, OnInit} from '@angular/core';
import {AbstractControl, FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  ResourceCreateOrganization,
  ResourceCreatePractitioner,
  ResourceCreatePractitionerData
} from '../../models/fasten/resource_create';
import {uuidV4} from '../../../lib/utils/uuid';

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

  collapsePanel: {[name: string]: boolean} = {}


  @Input() form!: FormGroup;
  newPractitionerForm: FormGroup
  newPractitionerModel: ResourceCreatePractitioner

  newOrganizationForm: FormGroup
  newOrganizationModel: ResourceCreateOrganization
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


  constructor(private modalService: NgbModal) { }

  ngOnInit(): void {


    //https://stackoverflow.com/questions/52038071/creating-nested-form-groups-using-angular-reactive-forms
    //https://www.danywalls.com/creating-dynamic-forms-in-angular-a-step-by-step-guide
    //https://www.telerik.com/blogs/angular-basics-creating-dynamic-forms-using-formarray-angular
    //https://angular.io/guide/reactive-forms#creating-dynamic-forms
    //https://angular.io/guide/dynamic-form
    this.form = new FormGroup({
      condition: new FormGroup({
        data: new FormControl(null, Validators.required),
        status: new FormControl(null, Validators.required),
        started: new FormControl(null, Validators.required),
        stopped: new FormControl(null),
        description: new FormControl(null),
      }),

      medications: new FormArray([]),
      procedures: new FormArray([]),
      practitioners: new FormArray([]),
      organizations: new FormArray([]),
    });
  }

  get medications(): FormArray {
    return this.form.controls["medications"] as FormArray;
  }
  addMedication(){
    const medicationGroup = new FormGroup({
      data: new FormControl(null, Validators.required),
      status: new FormControl(null, Validators.required),
      dosage: new FormControl({
        value: '', disabled: true
      }),
      started: new FormControl(null, Validators.required),
      stopped: new FormControl(null),
      whystopped: new FormControl(null),
      requester: new FormControl(null, Validators.required),
      instructions: new FormControl(null),
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
      data: new FormControl(null, Validators.required),
      whendone: new FormControl(null, Validators.required),
      performer: new FormControl(null),
      location: new FormControl(null),
      comment: new FormControl('')
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
      profession: new FormControl(practitioner.profession, Validators.required),
      name: new FormControl(practitioner.name, Validators.required),
      phone: new FormControl(practitioner.phone, Validators.pattern('[- +()0-9]+')),
      fax: new FormControl(practitioner.fax, Validators.pattern('[- +()0-9]+')),
      email: new FormControl(practitioner.email, Validators.email),
      address: new FormControl(practitioner.address),
      comment: new FormControl(practitioner.comment),
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
      name: new FormControl(organization.name, Validators.required),
      phone: new FormControl(organization.phone, Validators.pattern('[- +()0-9]+')),
      fax: new FormControl(organization.fax, Validators.pattern('[- +()0-9]+')),
      email: new FormControl(organization.email, Validators.email),
      address: new FormControl(organization.address),
      comment: new FormControl(organization.comment),
    });

    this.organizations.push(organizationGroup);
  }
  deleteOrganization(index: number) {
    this.organizations.removeAt(index);
  }




  onSubmit() {
    console.log(this.form.getRawValue())
    this.form.markAllAsTouched()
    if (this.form.valid) {
      console.log('form submitted');
    }


  }

  //Modal Helpers
  openPractitionerModal(content, formGroup?: AbstractControl, controlName?: string) {
    this.resetPractitionerForm()
    this.modalService.open(content, { ariaLabelledBy: 'modal-practitioner' }).result.then(
      (result) => {
        console.log(`Closed with: ${result}`);
        //add this to the list of practitioners
        result.id = uuidV4();
        this.addPractitioner(result);
        if(formGroup && controlName){
          //set this practitioner to the current select box
          formGroup.get(controlName).setValue(result.id);
        }
      },
      (reason) => {
        console.log(`Dismissed ${this.getDismissReason(reason)}`)
      },
    );
  }

  openOrganizationModal(content, formGroup?: AbstractControl, controlName?: string) {
    this.resetOrganizationForm()

    this.modalService.open(content, { ariaLabelledBy: 'modal-organization' }).result.then(
      (result) => {
        console.log(`Closed with: ${result}`);
        //add this to the list of organization
        result.id = uuidV4();
        this.addOrganization(result);
        if(formGroup && controlName){
          //set this practitioner to the current select box
          formGroup.get(controlName).setValue(result.id);
        }
      },
      (reason) => {
        console.log(`Dismissed ${this.getDismissReason(reason)}`)
      },
    );
  }

  private resetPractitionerForm(){
    this.newPractitionerForm = new FormGroup({
      data: new FormControl({}),
    })
    this.newPractitionerForm.get("data").valueChanges.subscribe(val => {
      console.log("CHANGE INDIVIDUAL IN MODAL", val)
      if(val.provider_phone){
        this.newPractitionerModel.phone = val.provider_phone;
      }
      if(val.provider_fax){
        this.newPractitionerModel.fax = val.provider_fax;
      }
      if(val.provider_type){
        this.newPractitionerModel.profession = {id: val.provider_type, text: val.provider_type}
      }
      if(val.provider_address){
        this.newPractitionerModel.address = val.provider_address
      }
      if(val.text) {
        this.newPractitionerModel.name = val.text;
      }
    });


    this.newPractitionerModel = {
      name: '',
      profession: {},
      phone: '',
      address: '',
      fax: '',
      email: '',
      comment: ''
    };
  }

  private resetOrganizationForm(){
    this.newOrganizationForm = new FormGroup({
      data: new FormControl({}),
    })
    this.newOrganizationForm.get("data").valueChanges.subscribe(val => {
      console.log("CHANGE Organization IN MODAL", val)
      if(val.provider_phone){
        this.newOrganizationModel.phone = val.provider_phone;
      }
      if(val.provider_fax){
        this.newOrganizationModel.fax = val.provider_fax;
      }
      if(val.provider_address){
        this.newOrganizationModel.address = val.provider_address
      }
      if(val.text) {
        this.newOrganizationModel.name = val.text;
      }
    });


    this.newOrganizationModel = {
      name: '',
      phone: '',
      fax: '',
      email: '',
      address: '',
      comment: ''
    };
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
}
