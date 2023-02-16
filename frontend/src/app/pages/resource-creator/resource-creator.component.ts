import {Component, Input, OnInit} from '@angular/core';
import {FormArray, FormControl, FormGroup} from '@angular/forms';

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


  constructor() { }

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
      dosage: new FormControl({}),
      started: new FormControl({}),
      stopped: new FormControl({}),
      whystopped: new FormControl({}),
      resupply: new FormControl({}),
      instructions: new FormControl(''),
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

  addPractitioner(contactType: ContactType | string){
    const practitionerGroup = new FormGroup({
      contactType: new FormControl(contactType),
      name: new FormControl(''),
      data: new FormControl({}),
      profession: new FormControl({}),
      phone: new FormControl(''),
      fax: new FormControl(''),
      email: new FormControl(''),
      comment: new FormControl(''),
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
    console.log(this.form)
  }
}
