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
      procedures: new FormArray([])
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
  deleteMedication(medicationIndex: number) {
    this.medications.removeAt(medicationIndex);
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
  deleteProcedure(surgeryIndex: number) {
    this.procedures.removeAt(surgeryIndex);
  }

  onSubmit() {
    console.log(this.form)
  }
}
