import {Component, Input, OnInit} from '@angular/core';
import {AbstractControl, FormArray, FormControl, FormGroup} from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {ResourceCreatePractitioner, ResourceCreatePractitionerData} from '../../models/fasten/resource_create';
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
        data: new FormControl({}),
        status: new FormControl(''),
        started: new FormControl({}),
        stopped: new FormControl({}),
        description: new FormControl(''),
      }),

      medications: new FormArray([]),
      procedures: new FormArray([]),
      practitioners: new FormArray([]),
      locations: new FormArray([]),
    });
  }

  get medications(): FormArray {
    return this.form.controls["medications"] as FormArray;
  }
  addMedication(){
    const medicationGroup = new FormGroup({
      data: new FormControl({}),
      status: new FormControl(''),
      dosage: new FormControl({
        value: '', disabled: true
      }),
      started: new FormControl({}),
      stopped: new FormControl({}),
      whystopped: new FormControl({}),
      requester: new FormControl(''),
      instructions: new FormControl(''),
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
      data: new FormControl({}),
      whendone: new FormControl({}),
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
      id: new FormControl(practitioner.id),
      profession: new FormControl(practitioner.profession),
      name: new FormControl(practitioner.name),
      phone: new FormControl(practitioner.phone),
      fax: new FormControl(practitioner.fax),
      email: new FormControl(practitioner.email),
      address: new FormControl(practitioner.address),
      comment: new FormControl(practitioner.comment),
    });

    this.practitioners.push(practitionerGroup);
  }

  deletePractitioner(index: number) {
    this.practitioners.removeAt(index);
  }


  get locations(): FormArray {
    return this.form.controls["locations"] as FormArray;
  }

  addLocation(contactType: ContactType | string){
    const locationGroup = new FormGroup({
      name: new FormControl(''),
      contactType: new FormControl(contactType),
      data: new FormControl({}),
      phone: new FormControl(''),
      fax: new FormControl(''),
      email: new FormControl(''),
      comment: new FormControl(''),
    });

    this.locations.push(locationGroup);
  }
  deleteLocation(index: number) {
    this.locations.removeAt(index);
  }




  onSubmit() {
    console.log(this.form.getRawValue())
  }

  //Modal Helpers
  openModal(content, formGroup?: AbstractControl, controlName?: string) {
    this.newPractitionerForm = new FormGroup({
      data: new FormControl({}),
    })
    this.newPractitionerForm.get("data").valueChanges.subscribe(val => {
      // @ts-ignore
      console.log("CHANGE INDIVIDUAL IN MODAL", val)
      // @ts-ignore
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
      // @ts-ignore
      data: {},
      name: '',
      profession: {},
      phone: '',
      fax: '',
      email: '',
      comment: ''
    };

    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then(
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
