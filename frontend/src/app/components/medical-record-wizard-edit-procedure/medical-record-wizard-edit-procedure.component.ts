import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NlmTypeaheadComponent } from '../nlm-typeahead/nlm-typeahead.component';
import { HighlightModule } from 'ngx-highlightjs';
import { NgbActiveModal, NgbDatepickerModule, NgbNavModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { FhirDatatableModule } from '../fhir-datatable/fhir-datatable.module';
import { FastenApiService } from '../../services/fasten-api.service';
import { EncounterModel } from '../../../lib/models/resources/encounter-model';
import { OrganizationModel, PractitionerModel, ProcedureModel } from 'src/lib/public-api';
import { NlmSearchResults } from 'src/app/services/nlm-clinical-table-search.service';
import { generateReferenceUriFromResourceOrReference } from 'src/lib/utils/bundle_references';

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
  selector: 'app-medical-record-wizard-edit-procedure',
  templateUrl: './medical-record-wizard-edit-procedure.component.html',
  styleUrls: ['./medical-record-wizard-edit-procedure.component.scss']
})
export class MedicalRecordWizardEditProcedureComponent implements OnInit {
  @Input() debugMode: boolean = false
  @Input() procedure: ProcedureModel
  @Input() practitioners: PractitionerModel[]
  @Input() organizations: OrganizationModel[]
  loading: boolean = false

  //create tab options
  procedureForm: FormGroup

  constructor(
    public activeModal: NgbActiveModal,
  ) { }

  ngOnInit(): void {
    //get a count of all the known encounters
    this.initializeForm()
  }

  private initializeForm(): void {
    this.procedureForm = new FormGroup({
      data: new FormControl<NlmSearchResults>(null, Validators.required),
      whendone: new FormControl(null, Validators.required),
      performer: new FormControl(null),
      location: new FormControl(null),
      comment: new FormControl(''),
    });

    if (this.procedure) {
      this.populateForm(this.procedure)
    }
  }

  private populateForm(procedure: ProcedureModel): void {
    if (procedure?.code) {
      if (!procedure.code.text && procedure.code.coding?.[0].display) {
        procedure.code.text = procedure.code.coding?.[0].display
      }
      this.procedureForm.get('data').setValue(procedure?.code)
    }
    this.procedureForm.get('data').setValue(procedure?.code)

    this.procedureForm.get('whendone').setValue(this.convertToNgbDateStruct(procedure?.performed_datetime))

    this.procedureForm.get('comment').setValue(procedure?.note?.[0]?.text)

    let actorReference = procedure?.performer?.[0]?.actor?.reference
    if (actorReference) {
      let performer = this.practitioners.find((pracitioner) => {
        let referenceUri = generateReferenceUriFromResourceOrReference(pracitioner)
        return actorReference == referenceUri
      })
      if (performer) {
        this.procedureForm.get('performer').setValue(performer)
      }
    }

    let onBehalfOfReference = procedure?.performer?.[0]?.onBehalfOf?.reference
    if (onBehalfOfReference) {
      let location = this.organizations.find((organization) => {
        let referenceUri = generateReferenceUriFromResourceOrReference(organization)
        return onBehalfOfReference == referenceUri
      })
      if (location) {
        this.procedureForm.get('location').setValue(location)
      }
    }
  }

  get submitEnabled() {
    return this.procedureForm.valid
  }

  submit() {
    let procedure = this.procedure

    procedure.code = this.procedureForm.get('data').value
    if (procedure.code?.text) {
      procedure.sort_title = procedure.code.text
      procedure.display = procedure.code.text
    }

    let performedDate = this.procedureForm.get('whendone').value
    procedure.performed_datetime = (new Date(performedDate.year, performedDate.month - 1, performedDate.day)).toISOString()

    if (this.procedureForm.get('comment').value) {
      procedure.note = [{ text: this.procedureForm.get('comment').value }]
    }

    procedure.performer = [{
      'actor': {
        'reference': procedure.performer?.[0]?.actor?.reference
      },
      'onBehalfOf': {
        'reference': procedure.performer?.[0]?.onBehalfOf?.reference
      }
    }]

    if (this.procedureForm.get('performer').value) {
      procedure.performer[0].actor.reference = generateReferenceUriFromResourceOrReference(this.procedureForm.get('performer').value)
    }

    if (this.procedureForm.get('location').value) {
      procedure.performer[0].onBehalfOf.reference = generateReferenceUriFromResourceOrReference(this.procedureForm.get('location').value)
    }

    this.activeModal.close(procedure);
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

