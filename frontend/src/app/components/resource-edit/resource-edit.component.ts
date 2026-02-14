import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  NgbActiveModal,
  NgbDatepickerModule,
  NgbDateStruct,
} from '@ng-bootstrap/ng-bootstrap';
import { FastenApiService } from '../../services/fasten-api.service';
import { ToastService } from '../../services/toast.service';
import { ToastNotification, ToastType } from '../../models/fasten/toast';
import { extractErrorFromResponse } from '../../../lib/utils/error_extract';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgbDatepickerModule,
  ],
  selector: 'app-resource-edit',
  templateUrl: './resource-edit.component.html',
  styleUrls: ['./resource-edit.component.scss'],
})
export class ResourceEditComponent implements OnInit {
  @Input() resourceRaw: any;
  @Input() resourceType: string;
  @Input() sourceId: string;
  @Input() sourceResourceId: string;

  form: FormGroup;
  saving = false;

  constructor(
    public activeModal: NgbActiveModal,
    private fastenApi: FastenApiService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  getResourceDisplayName(): string {
    if (this.resourceRaw?.code?.coding?.[0]?.display) {
      return this.resourceRaw.code.coding[0].display;
    }
    if (this.resourceRaw?.code?.text) {
      return this.resourceRaw.code.text;
    }
    if (this.resourceRaw?.medicationCodeableConcept?.coding?.[0]?.display) {
      return this.resourceRaw.medicationCodeableConcept.coding[0].display;
    }
    if (this.resourceRaw?.medicationCodeableConcept?.text) {
      return this.resourceRaw.medicationCodeableConcept.text;
    }
    if (this.resourceRaw?.vaccineCode?.coding?.[0]?.display) {
      return this.resourceRaw.vaccineCode.coding[0].display;
    }
    if (this.resourceRaw?.vaccineCode?.text) {
      return this.resourceRaw.vaccineCode.text;
    }
    return this.resourceType;
  }

  onSubmit(): void {
    if (this.form.invalid || this.saving) {
      return;
    }
    this.saving = true;
    this.mergeFormIntoResource();

    this.fastenApi
      .updateResourceBySourceId(
        this.sourceId,
        this.sourceResourceId,
        this.resourceRaw,
      )
      .subscribe(
        () => {
          const toast = new ToastNotification();
          toast.type = ToastType.Success;
          toast.message = 'Resource updated successfully';
          this.toastService.show(toast);
          this.saving = false;
          this.activeModal.close(this.resourceRaw);
        },
        (err) => {
          const toast = new ToastNotification();
          toast.type = ToastType.Error;
          toast.message = `Error updating resource: ${extractErrorFromResponse(err)}`;
          this.toastService.show(toast);
          this.saving = false;
        },
      );
  }

  private buildForm(): void {
    switch (this.resourceType) {
      case 'Condition':
        this.form = new FormGroup({
          clinicalStatus: new FormControl(
            this.resourceRaw?.clinicalStatus?.coding?.[0]?.code || '',
          ),
          onsetDateTime: new FormControl(
            this.parseDate(this.resourceRaw?.onsetDateTime),
          ),
          abatementDateTime: new FormControl(
            this.parseDate(this.resourceRaw?.abatementDateTime),
          ),
          note: new FormControl(this.resourceRaw?.note?.[0]?.text || ''),
        });
        break;

      case 'Observation':
        this.form = new FormGroup({
          status: new FormControl(this.resourceRaw?.status || ''),
          effectiveDateTime: new FormControl(
            this.parseDate(this.resourceRaw?.effectiveDateTime),
          ),
          valueQuantityValue: new FormControl(
            this.resourceRaw?.valueQuantity?.value ?? '',
          ),
          valueQuantityUnit: new FormControl(
            this.resourceRaw?.valueQuantity?.unit || '',
          ),
          valueString: new FormControl(this.resourceRaw?.valueString || ''),
          note: new FormControl(this.resourceRaw?.note?.[0]?.text || ''),
        });
        break;

      case 'MedicationRequest':
        this.form = new FormGroup({
          status: new FormControl(this.resourceRaw?.status || ''),
          intent: new FormControl(this.resourceRaw?.intent || ''),
          authoredOn: new FormControl(
            this.parseDate(this.resourceRaw?.authoredOn),
          ),
          dosage: new FormControl(
            this.resourceRaw?.dosageInstruction?.[0]?.text || '',
          ),
          note: new FormControl(this.resourceRaw?.note?.[0]?.text || ''),
        });
        break;

      case 'Encounter':
        this.form = new FormGroup({
          status: new FormControl(this.resourceRaw?.status || ''),
          periodStart: new FormControl(
            this.parseDate(this.resourceRaw?.period?.start),
          ),
          periodEnd: new FormControl(
            this.parseDate(this.resourceRaw?.period?.end),
          ),
        });
        break;

      case 'AllergyIntolerance':
        this.form = new FormGroup({
          clinicalStatus: new FormControl(
            this.resourceRaw?.clinicalStatus?.coding?.[0]?.code || '',
          ),
          category: new FormControl(this.resourceRaw?.category?.[0] || ''),
          recordedDate: new FormControl(
            this.parseDate(this.resourceRaw?.recordedDate),
          ),
          note: new FormControl(this.resourceRaw?.note?.[0]?.text || ''),
        });
        break;

      case 'Procedure':
        this.form = new FormGroup({
          status: new FormControl(this.resourceRaw?.status || ''),
          performedDateTime: new FormControl(
            this.parseDate(this.resourceRaw?.performedDateTime),
          ),
          note: new FormControl(this.resourceRaw?.note?.[0]?.text || ''),
        });
        break;

      case 'Immunization':
        this.form = new FormGroup({
          status: new FormControl(this.resourceRaw?.status || ''),
          occurrenceDateTime: new FormControl(
            this.parseDate(this.resourceRaw?.occurrenceDateTime),
          ),
          note: new FormControl(this.resourceRaw?.note?.[0]?.text || ''),
        });
        break;

      default:
        this.form = new FormGroup({});
    }
  }

  private mergeFormIntoResource(): void {
    const v = this.form.value;

    switch (this.resourceType) {
      case 'Condition':
        if (v.clinicalStatus) {
          this.resourceRaw.clinicalStatus = {
            coding: [
              {
                system:
                  'http://terminology.hl7.org/CodeSystem/condition-clinical',
                code: v.clinicalStatus,
              },
            ],
          };
        }
        this.resourceRaw.onsetDateTime =
          this.toIsoDate(v.onsetDateTime) || this.resourceRaw.onsetDateTime;
        if (v.abatementDateTime) {
          this.resourceRaw.abatementDateTime = this.toIsoDate(
            v.abatementDateTime,
          );
        }
        this.mergeNote(v.note);
        break;

      case 'Observation':
        if (v.status) {
          this.resourceRaw.status = v.status;
        }
        this.resourceRaw.effectiveDateTime =
          this.toIsoDate(v.effectiveDateTime) ||
          this.resourceRaw.effectiveDateTime;
        if (this.resourceRaw.valueQuantity) {
          if (v.valueQuantityValue !== '' && v.valueQuantityValue !== null) {
            this.resourceRaw.valueQuantity.value = parseFloat(
              v.valueQuantityValue,
            );
          }
          if (v.valueQuantityUnit) {
            this.resourceRaw.valueQuantity.unit = v.valueQuantityUnit;
          }
        }
        if (this.resourceRaw.valueString !== undefined) {
          this.resourceRaw.valueString = v.valueString;
        }
        this.mergeNote(v.note);
        break;

      case 'MedicationRequest':
        if (v.status) {
          this.resourceRaw.status = v.status;
        }
        if (v.intent) {
          this.resourceRaw.intent = v.intent;
        }
        this.resourceRaw.authoredOn =
          this.toIsoDate(v.authoredOn) || this.resourceRaw.authoredOn;
        if (v.dosage) {
          this.resourceRaw.dosageInstruction = this.resourceRaw
            .dosageInstruction || [{}];
          this.resourceRaw.dosageInstruction[0].text = v.dosage;
        }
        this.mergeNote(v.note);
        break;

      case 'Encounter':
        if (v.status) {
          this.resourceRaw.status = v.status;
        }
        this.resourceRaw.period = this.resourceRaw.period || {};
        this.resourceRaw.period.start =
          this.toIsoDate(v.periodStart) || this.resourceRaw.period.start;
        this.resourceRaw.period.end =
          this.toIsoDate(v.periodEnd) || this.resourceRaw.period.end;
        break;

      case 'AllergyIntolerance':
        if (v.clinicalStatus) {
          this.resourceRaw.clinicalStatus = {
            coding: [
              {
                system:
                  'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
                code: v.clinicalStatus,
              },
            ],
          };
        }
        if (v.category) {
          this.resourceRaw.category = [v.category];
        }
        this.resourceRaw.recordedDate =
          this.toIsoDate(v.recordedDate) || this.resourceRaw.recordedDate;
        this.mergeNote(v.note);
        break;

      case 'Procedure':
        if (v.status) {
          this.resourceRaw.status = v.status;
        }
        this.resourceRaw.performedDateTime =
          this.toIsoDate(v.performedDateTime) ||
          this.resourceRaw.performedDateTime;
        this.mergeNote(v.note);
        break;

      case 'Immunization':
        if (v.status) {
          this.resourceRaw.status = v.status;
        }
        this.resourceRaw.occurrenceDateTime =
          this.toIsoDate(v.occurrenceDateTime) ||
          this.resourceRaw.occurrenceDateTime;
        this.mergeNote(v.note);
        break;
    }
  }

  private mergeNote(noteText: string): void {
    if (noteText) {
      this.resourceRaw.note = this.resourceRaw.note || [];
      if (this.resourceRaw.note.length > 0) {
        this.resourceRaw.note[0].text = noteText;
      } else {
        this.resourceRaw.note.push({ text: noteText });
      }
    } else if (this.resourceRaw.note?.length > 0) {
      this.resourceRaw.note[0].text = '';
    }
  }

  parseDate(isoString: string): NgbDateStruct | null {
    if (!isoString) return null;
    // Parse date-only strings (YYYY-MM-DD) directly to avoid UTC timezone shift
    const dateOnlyMatch = isoString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dateOnlyMatch) {
      return {
        year: parseInt(dateOnlyMatch[1]),
        month: parseInt(dateOnlyMatch[2]),
        day: parseInt(dateOnlyMatch[3]),
      };
    }
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return null;
    return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
  }

  toIsoDate(dateStruct: NgbDateStruct): string | null {
    if (!dateStruct) return null;
    return new Date(
      dateStruct.year,
      dateStruct.month - 1,
      dateStruct.day,
    ).toISOString();
  }

  hasValueQuantity(): boolean {
    return this.resourceRaw?.valueQuantity !== undefined;
  }

  hasValueString(): boolean {
    return this.resourceRaw?.valueString !== undefined;
  }
}
