import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NlmTypeaheadComponent } from '../nlm-typeahead/nlm-typeahead.component';
import { HighlightModule } from 'ngx-highlightjs';
import { NgbActiveModal, NgbDatepickerModule, NgbNavModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { FhirDatatableModule } from '../fhir-datatable/fhir-datatable.module';
import { FastenApiService } from '../../services/fasten-api.service';
import { EncounterModel, MedicationModel, PractitionerModel } from 'src/lib/public-api';
import { NlmSearchResults } from 'src/app/services/nlm-clinical-table-search.service';
import { MedicationRequestModel } from 'src/lib/models/resources/medication-request-model';

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
  selector: 'app-medical-record-wizard-edit-medication',
  templateUrl: './medical-record-wizard-edit-medication.component.html',
  styleUrls: ['./medical-record-wizard-edit-medication.component.scss']
})
export class MedicalRecordWizardEditMedicationComponent implements OnInit {
  @Input() debugMode: boolean = false;
  @Input() medication: MedicationModel;
  @Input() medicationRequest: MedicationRequestModel;
  @Input() practitioners: PractitionerModel[];
  loading: boolean = false

  medicationForm: FormGroup

  totalEncounters: number = 0
  constructor(
    public activeModal: NgbActiveModal,
  ) { }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.medicationForm = new FormGroup({
      data: new FormControl<NlmSearchResults>(null, Validators.required),
      status: new FormControl(null, Validators.required),
      dosage: new FormControl({
        value: '', disabled: true
      }),
      started: new FormControl(null, Validators.required),
      requester: new FormControl(null, Validators.required),
      instructions: new FormControl(null),
    });

    this.medicationForm.get("data").valueChanges.subscribe(val => {
      this.medicationForm.get("dosage").enable();
    });

    if (this.medication && this.medicationRequest) {
      this.populateForm(this.medication, this.medicationRequest)
    }
  }

  private populateForm(medication: MedicationModel, medicationRequest: MedicationRequestModel): void {
    this.medicationForm.get("data").setValue(medication.code)

    this.medicationForm.get("status").setValue(medicationRequest.status)

    this.medicationForm.get("dosage").setValue(medicationRequest.dosage_instruction?.[0]?.sequence)

    this.medicationForm.get("instructions").setValue(medicationRequest.dosage_instruction?.[0]?.text)

    this.medicationForm.get("started").setValue(this.convertToNgbDateStruct(medicationRequest.created))

    let practitioner = this.practitioners.find((practitioner) => medicationRequest.requester.reference == `Practitioner/${practitioner.source_resource_id}`)
    this.medicationForm.get("requester").setValue(practitioner)
  }

  get submitEnabled() {
    return this.medicationForm.valid
  }

  submit() {
    let medication = this.medication
    medication.code = this.medicationForm.get("data").value
    if (medication.code?.text) {
      medication.sort_title = medication.code.text
      medication.title = medication.code.text
    }
    
    let medicationRequest = this.medicationRequest

    medicationRequest.status = this.medicationForm.get("status").value

    let startedDate = this.medicationForm.get("started").value
    medicationRequest.created = (new Date(startedDate.year, startedDate.month - 1, startedDate.day)).toISOString()

    let practitioner = this.medicationForm.get("requester").value
    medicationRequest.requester.reference = `Practitioner/${practitioner.source_resource_id}`

    if (this.medicationForm.get("dosage").value) {
      medicationRequest.dosage_instruction = medicationRequest.dosage_instruction || []
      medicationRequest.dosage_instruction[0].sequence = this.medicationForm.get("dosage").value
    }

    if (this.medicationForm.get("instructions").value) {
      medicationRequest.dosage_instruction = medicationRequest.dosage_instruction || []
      medicationRequest.dosage_instruction[0].text = this.medicationForm.get("instructions").value
    }

    this.activeModal.close({
      medication: medication,
      medicationRequest: medicationRequest
    })
  }

  private convertToNgbDateStruct(isoDateString: string): { year: number, month: number, day: number } | null {
    if (!isoDateString) return null;
    try {
      const date = new Date(isoDateString);
      return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate()
      };
    } catch (e) {
      console.error("Error parsing date for form: ", isoDateString, e);
      return null;
    }
  }
}
