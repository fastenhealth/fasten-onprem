import {Component, Input, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {NlmTypeaheadComponent} from '../nlm-typeahead/nlm-typeahead.component';
import {HighlightModule} from 'ngx-highlightjs';
import {NgbActiveModal, NgbDatepickerModule, NgbNavModule, NgbTooltipModule} from '@ng-bootstrap/ng-bootstrap';
import {FhirDatatableModule} from '../fhir-datatable/fhir-datatable.module';
import {FastenApiService} from '../../services/fasten-api.service';
import {EncounterModel} from '../../../lib/models/resources/encounter-model';

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
  selector: 'app-medical-record-wizard-edit-encounter',
  templateUrl: './medical-record-wizard-edit-encounter.component.html',
  styleUrls: ['./medical-record-wizard-edit-encounter.component.scss']
})
export class MedicalRecordWizardEditEncounterComponent implements OnInit {
  @Input() debugMode: boolean = false;
  @Input() encounter: EncounterModel;
  loading: boolean = false

  //create tab options
  encounterForm: FormGroup //ResourceCreateEncounter

  //find tab options
  totalEncounters: number = 0
  constructor(
    public activeModal: NgbActiveModal,
    private fastenApi: FastenApiService,
  ) { }

  ngOnInit(): void {
    //get a count of all the known encounters
    this.initializeForm();
  }

  private initializeForm(): void {
    this.encounterForm = new FormGroup({
      code: new FormControl(null, Validators.required),
      period_start: new FormControl(null, Validators.required),
      period_end: new FormControl(null),
    })
    
    if (this.encounter) {
      this.encounterForm.patchValue({
        code: this.encounter.code,
        period_start: this.convertToNgbDateStruct(this.encounter.period_start),
        period_end: this.convertToNgbDateStruct(this.encounter.period_end),
      })
    }
  }

  get submitEnabled() {
    return this.encounterForm.valid
  }

  submit() {
    let encounter = this.encounter
    encounter.code = this.encounterForm.get('code').value
    encounter.sort_title = encounter.code.text

    if(this.encounterForm.get('period_start').value){
      let period_start = this.encounterForm.get('period_start').value
      encounter.period_start = (new Date(period_start.year, period_start.month-1, period_start.day)).toISOString()
    }
    if(this.encounterForm.get('period_end').value){
      let period_end = this.encounterForm.get('period_end').value
      encounter.period_end = (new Date(period_end.year, period_end.month-1, period_end.day)).toISOString()
    }

    this.activeModal.close(encounter)
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
