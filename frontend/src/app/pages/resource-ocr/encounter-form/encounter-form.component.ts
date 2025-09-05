import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Bundle, FhirResource, List, Reference } from 'fhir/r4';
import { ConfirmationModalComponent } from 'src/app/components/confirmation-modal/confirmation-modal.component';
import { MedicalRecordWizardAddAttachmentComponent } from 'src/app/components/medical-record-wizard-add-attachment/medical-record-wizard-add-attachment.component';
import { MedicalRecordWizardAddLabResultsComponent } from 'src/app/components/medical-record-wizard-add-lab-results/medical-record-wizard-add-lab-results.component';
import { MedicalRecordWizardAddOrganizationComponent } from 'src/app/components/medical-record-wizard-add-organization/medical-record-wizard-add-organization.component';
import { MedicalRecordWizardAddPractitionerComponent } from 'src/app/components/medical-record-wizard-add-practitioner/medical-record-wizard-add-practitioner.component';
import { MedicalRecordWizardEditLabResultsComponent } from 'src/app/components/medical-record-wizard-edit-lab-results/medical-record-wizard-edit-lab-results.component';
import { MedicalRecordWizardEditMedicationComponent } from 'src/app/components/medical-record-wizard-edit-medication/medical-record-wizard-edit-medication.component';
import { MedicalRecordWizardEditOrganizationComponent } from 'src/app/components/medical-record-wizard-edit-organization/medical-record-wizard-edit-organization.component';
import { MedicalRecordWizardEditPractitionerComponent } from 'src/app/components/medical-record-wizard-edit-practitioner/medical-record-wizard-edit-practitioner.component';
import { MedicalRecordWizardEditProcedureComponent } from 'src/app/components/medical-record-wizard-edit-procedure/medical-record-wizard-edit-procedure.component';
import {
  GenerateR4ResourceLookup,
  OrganizationToR4Organization,
  PractitionerToR4Practitioner,
  UpdateMedicationRequestToR4MedicationRequest,
  UpdateMedicationToR4Medication,
  UpdateProcedureToR4Procedure,
  WizardFhirResourceWrapper,
} from 'src/app/components/medical-record-wizard/medical-record-wizard.utilities';
import { ResourceCreateAttachment } from 'src/app/models/fasten/resource_create';
import { FastenApiService } from 'src/app/services/fasten-api.service';
import { NlmSearchResults } from 'src/app/services/nlm-clinical-table-search.service';
import { FastenDisplayModel } from 'src/lib/models/fasten/fasten-display-model';
import { MedicationRequestModel } from 'src/lib/models/resources/medication-request-model';
import {
  DiagnosticReportModel,
  EncounterModel,
  MedicationModel,
  ObservationModel,
  OrganizationModel,
  PractitionerModel,
  ProcedureModel,
} from 'src/lib/public-api';
import { generateReferenceUriFromResourceOrReference } from 'src/lib/utils/bundle_references';
import { RecResourceRelatedDisplayModel } from 'src/lib/utils/resource_related_display_model';
import { uuidV4 } from 'src/lib/utils/uuid';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OcrDataService } from 'src/app/services/ocr-data.service';
import { Subscription } from 'rxjs';
import { ResponseWrapper } from 'src/app/models/response-wrapper';
import { Router } from '@angular/router';

interface NlmMedicationIdentifier {
  system: string;
  code: string;
  display: string;
}

interface NlmMedication {
  id: string;
  text: string;
  identifier: NlmMedicationIdentifier[];
}

interface EnrichedMedication {
  extracted_name: string;
  dosage: string;
  nlm_data?: NlmMedication;
  search_term: string;
}

@Component({
  selector: 'app-encounter-form',
  templateUrl: './encounter-form.component.html',
  styleUrls: ['./encounter-form.component.scss'],
})
export class EncounterFormComponent implements OnInit {
  private sub = new Subscription();

  form!: FormGroup;

  submitWizardLoading = false;
  debugMode = false;
  existingEncounter: EncounterModel = null;
  fastenSourceId = '';
  editMode = true; // Initially, the user starts in edit mode in order to adjust the form
  foundPractitioners = [];

  constructor(
    private modalService: NgbModal,
    private fastenApi: FastenApiService,
    private ocrService: OcrDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get all practitioners for the dropdowns
    this.fastenApi
      .queryResources({
        select: [],
        from: 'Practitioner',
        where: {},
      })
      .subscribe((resp: ResponseWrapper) => {
        this.foundPractitioners = resp.data.map(
          (item) => new PractitionerModel(item?.resource_raw)
        );
      });

    this.form = new FormGroup({
      encounter: new FormGroup({
        data: new FormGroup({
          code: new FormControl('', Validators.required),
          period_start: new FormControl(''),
          period_end: new FormControl(''),
        }),
        action: new FormControl(null),
      }),
      medications: new FormArray([]),
      procedures: new FormArray([]),
      practitioners: new FormArray([]),
      organizations: new FormArray([]),
      labresults: new FormArray([]),
      attachments: new FormArray([]),
    });

    if (this.existingEncounter) {
      this.addEncounter({ data: this.existingEncounter, action: 'find' });
    }

    // Subscribe to OCR changes
    this.sub.add(
      this.ocrService.ocrData$.subscribe((ocrData) => {
        if (ocrData) {
          const encounterGroup = this.form.get('encounter.data') as FormGroup;

          if (ocrData.encounterType) {
            encounterGroup.get('code')?.setValue({
              id: ocrData.encounterType.code,
              identifier: [ocrData.encounterType],
              text: ocrData.encounterType.display,
            });
          }

          if (ocrData.date) {
            this.processOcrDate(ocrData, encounterGroup);
          }

          // If we have enough data from OCR to create an encounter, add it
          if (ocrData.encounterType && ocrData.date) {
            const resultedEncounterModel =
              this.encounterFormToDisplayModel(encounterGroup);
            this.addEncounter({
              action: 'create',
              data: resultedEncounterModel,
            });
          }

          // Process medications from OCR if available
          if (ocrData.medications && ocrData.medications.length > 0) {
            this.processOCRMedications(
              ocrData.medications,
              ocrData?.date,
              ocrData?.doctorName
            );
          }

          // Process practitioner (doctor) from OCR if available
          if (ocrData.doctorName) {
            // Check if practitioner already exists in the list
            const existing = this.foundPractitioners.find(
              (pract) =>
                pract.name &&
                pract.name?.[0]?.displayName?.toLowerCase() ===
                  ocrData.doctorName.toLowerCase()
            );
            if (existing) {
              // If found, add existing practitioner
              this.addPractitioner({ data: existing, action: 'find' });
            } else {
              const newPractitioner = new PractitionerModel({
                resourceType: 'Practitioner',
                name: [],
              });

              newPractitioner.name.push({
                textName: ocrData.doctorName,
                use: 'official',
                givenName: ocrData.doctorName, // Simplification: put full name in givenName
                familyName: '',
                suffix: '',
                displayName: ocrData.doctorName,
              });

              // Generate a new UUID for source_resource_id
              newPractitioner.source_resource_id = uuidV4();

              this.addPractitioner({ data: newPractitioner, action: 'create' });
              this.addPractitionerFormGroupFromOCR(ocrData.doctorName);
            }
          }

          // If we have hospital name, add it as organization
          if (ocrData.hospital) {
            this.addOrganizationFormGroupFromOCR(ocrData.hospital);
          }
        }
      })
    );

    this.fastenApi.getSources().subscribe((sources) => {
      let fastenSource = sources.find(
        (source) => source.platform_type === 'fasten'
      );

      this.fastenSourceId = fastenSource?.id ?? '';
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  handleEditModeToggle() {
    this.editMode = !this.editMode;
    if (this.editMode) {
      this.form.enable();
    } else {
      this.form.disable();
    }
  }

  processOcrDate(ocrData, encounterGroup: FormGroup) {
    if (ocrData.date) {
      // Split the date string by forward slashes, dashes, or spaces
      const dateParts = ocrData.date
        .split(/[/\- ]/)
        .map((p) => parseInt(p, 10));
      if (dateParts.length === 3) {
        // Assuming MM/DD/YYYY, MM-DD-YYYY, or MM DD YYYY format
        encounterGroup.get('period_start')?.setValue({
          year: dateParts[2],
          month: dateParts[1],
          day: dateParts[0],
        });
      }
    }
  }

  // Method to process OCR text for medications
  private async processOCRMedications(
    extractedMedications: EnrichedMedication[],
    date?: string,
    doctorName?: string
  ): Promise<void> {
    try {
      if (extractedMedications && extractedMedications.length > 0) {
        const result = this.processExtractedMedications(
          extractedMedications,
          date,
          doctorName
        );

        console.log(
          `OCR Medication Processing: ${result.successCount} added, ${result.warningCount} warnings`
        );
      }
    } catch (error) {
      console.error('Error processing OCR medications:', error);
    }
  }

  // Process extracted medications and add them to the form
  private processExtractedMedications(
    extractedMedications: EnrichedMedication[],
    date?: string,
    doctorName?: string
  ) {
    const medicationsArray = this.form.get('medications') as FormArray;

    let successCount = 0;
    let warningCount = 0;
    const warnings: string[] = [];

    // Process each extracted medication
    extractedMedications.forEach((enrichedMed) => {
      try {
        const medicationGroup = this.createMedicationFormGroup(
          enrichedMed,
          date,
          doctorName
        );
        medicationsArray.push(medicationGroup);
        successCount++;

        // Log warning if NLM data is missing
        if (!enrichedMed.nlm_data) {
          const warning = `Medication "${enrichedMed.extracted_name}" could not be found in NLM database. You may need to search manually.`;
          warnings.push(warning);
          warningCount++;
          console.warn(warning);
        }
      } catch (error) {
        console.error(
          `Error processing medication "${enrichedMed.extracted_name}":`,
          error
        );
        const errorMsg = `Failed to add medication "${enrichedMed.extracted_name}" to form`;
        warnings.push(errorMsg);
      }
    });

    if (warnings.length > 0) {
      console.warn(`${warningCount} medications had issues:`, warnings);
    }

    return {
      successCount,
      warningCount,
      warnings,
      totalProcessed: extractedMedications.length,
    };
  }

  // Create a medication form group from extracted data
  private createMedicationFormGroup(
    enrichedMed: EnrichedMedication,
    date?: string,
    doctorName?: string
  ): FormGroup {
    const medicationGroup = new FormGroup({
      data: new FormControl<NlmSearchResults>(null, Validators.required),
      status: new FormControl('active', Validators.required),
      dosage: new FormControl({
        value: enrichedMed.dosage || '',
        disabled: false, // Enable since we have data
      }),
      started: new FormControl(date ?? null, Validators.required),
      stopped: new FormControl(null),
      whystopped: new FormControl(null),
      requester: new FormControl(doctorName ?? null, Validators.required),
      instructions: new FormControl(null),
      attachments: new FormControl([]),
      source_resource_id: new FormControl(uuidV4()), // Generate a new UUID for source_resource_id
    });

    // If we have NLM data, populate the data field
    if (enrichedMed.nlm_data) {
      const nlmSearchResult: NlmSearchResults = {
        id: enrichedMed.nlm_data.id,
        text: enrichedMed.nlm_data.text,
        identifier: enrichedMed.nlm_data.identifier,
      };

      medicationGroup.get('data')?.setValue(nlmSearchResult);
    } else {
      medicationGroup.get('data')?.setValue({
        id: uuidV4(),
        text: enrichedMed.extracted_name,
        identifier: [uuidV4()],
      });
    }

    // Set up the value change subscription for dosage enabling
    medicationGroup.get('data')?.valueChanges.subscribe((val) => {
      if (val) {
        medicationGroup.get('dosage')?.enable();
      }
    });

    return medicationGroup;
  }

  //<editor-fold desc="Getters">
  get medications(): FormArray<FormGroup> {
    return this.form.controls['medications'] as FormArray;
  }
  get procedures(): FormArray<FormGroup> {
    return this.form.controls['procedures'] as FormArray;
  }
  get practitioners(): FormArray<FormGroup> {
    return this.form.controls['practitioners'] as FormArray;
  }
  get organizations(): FormArray<FormGroup> {
    return this.form.controls['organizations'] as FormArray;
  }
  get labresults(): FormArray<FormGroup> {
    return this.form.controls['labresults'] as FormArray;
  }
  get attachments(): FormArray<FormGroup> {
    return this.form.controls['attachments'] as FormArray;
  }
  //</editor-fold>

  //<editor-fold desc="Delete Functions">
  deleteMedication(index: number) {
    this.medications.removeAt(index);
  }
  deleteProcedure(index: number) {
    this.procedures.removeAt(index);
  }
  deletePractitioner(index: number) {
    this.practitioners.removeAt(index);
  }
  deleteOrganization(index: number) {
    this.organizations.removeAt(index);
  }
  deleteLabResults(index: number) {
    this.labresults.removeAt(index);
  }
  deleteAttachment(index: number) {
    this.attachments.removeAt(index);
  }
  //</editor-fold>

  //<editor-fold desc="Form Add">
  addEncounter(openEncounterResult: WizardFhirResourceWrapper<EncounterModel>) {
    let encounter = openEncounterResult.data;
    this.existingEncounter = encounter;
  }

  private encounterFormToDisplayModel(form: FormGroup): EncounterModel {
    let encounter = new EncounterModel({});
    encounter.code = form.get('code').value;

    if (form.get('period_start').value) {
      let period_start = form.get('period_start').value;
      encounter.period_start = new Date(
        period_start.year,
        period_start.month - 1,
        period_start.day
      ).toISOString();
    }
    if (form.get('period_end').value) {
      let period_end = form.get('period_end').value;
      encounter.period_end = new Date(
        period_end.year,
        period_end.month - 1,
        period_end.day
      ).toISOString();
    }
    if (!encounter.source_resource_id) {
      encounter.source_resource_id = uuidV4();
    }
    return encounter;
  }

  addMedication() {
    const medicationGroup = new FormGroup({
      data: new FormControl<NlmSearchResults>(null, Validators.required),
      status: new FormControl(null, Validators.required),
      dosage: new FormControl({
        value: '',
        disabled: true,
      }),
      started: new FormControl(null, Validators.required),
      stopped: new FormControl(null),
      whystopped: new FormControl(null),
      requester: new FormControl(null, Validators.required),
      instructions: new FormControl(null),
      attachments: new FormControl([]),
    });

    medicationGroup.get('data').valueChanges.subscribe((val) => {
      medicationGroup.get('dosage').enable();
    });

    this.medications.push(medicationGroup);
  }

  addProcedure() {
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

  addPractitionerFormGroupFromOCR(doctorName: string) {
    const practitionerGroup = new FormGroup({
      identifier: new FormControl([]),
      name: new FormControl({ text: doctorName }, Validators.required),
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
      }),
      source_resource_id: new FormControl(uuidV4()), // Generate a new UUID for source_resource_id
    });

    this.practitioners.push(practitionerGroup);
  }

  addOrganizationFormGroupFromOCR(hospitalName: string) {
    const organizationGroup = new FormGroup({
      name: new FormControl({ text: hospitalName }, Validators.required),
      identifier: new FormControl([]),
      type: new FormControl({ text: 'Hospital' }, Validators.required), // Add default type
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
      }),
      source_resource_id: new FormControl(uuidV4()), // Generate a new UUID for source_resource_id
    });

    this.organizations.push(organizationGroup);
  }

  addPractitioner(
    openPractitionerResult: WizardFhirResourceWrapper<PractitionerModel>
  ) {
    this.foundPractitioners.push(openPractitionerResult.data); // Add to foundPractitioners list
  }

  addOrganization(
    openOrganizationResult: WizardFhirResourceWrapper<OrganizationModel>
  ) {
    const organizationGroup = new FormGroup({
      data: new FormControl(openOrganizationResult.data),
      action: new FormControl(openOrganizationResult.action),
    });
    this.organizations.push(organizationGroup);
  }
  addAttachment(attachment: ResourceCreateAttachment) {
    const attachmentGroup = new FormGroup({
      id: new FormControl(attachment.id, Validators.required),
      name: new FormControl(attachment.name, Validators.required),
      category: new FormControl(attachment.category, Validators.required),
      file_type: new FormControl(attachment.file_type, Validators.required),
      file_name: new FormControl(attachment.file_name, Validators.required),
      file_content: new FormControl(
        attachment.file_content,
        Validators.required
      ),
      file_size: new FormControl(attachment.file_size),
    });

    this.attachments.push(attachmentGroup);
  }
  addLabResultsBundle(
    diagnosticReportBundle: WizardFhirResourceWrapper<Bundle>
  ) {
    const diagnosticReportGroup = new FormGroup({
      data: new FormControl(diagnosticReportBundle.data),
      action: new FormControl(diagnosticReportBundle.action),
    });
    this.labresults.push(diagnosticReportGroup);
  }
  //</editor-fold>

  openPractitionerModal(formGroup?: AbstractControl, controlName?: string) {
    let disabledResourceIds = [];
    disabledResourceIds.push(
      ...(this.practitioners?.value || []).map(
        (practitioner) => practitioner.source_resource_id
      )
    );
    disabledResourceIds.push(
      ...(
        this.existingEncounter?.related_resources?.['Practitioner'] || []
      ).map((practitioner) => practitioner.source_resource_id)
    );

    console.log(disabledResourceIds);

    let modalRef = this.modalService.open(
      MedicalRecordWizardAddPractitionerComponent,
      {
        ariaLabelledBy: 'modal-practitioner',
        size: 'lg',
      }
    );
    modalRef.componentInstance.debugMode = this.debugMode;
    modalRef.componentInstance.disabledResourceIds = disabledResourceIds;
    modalRef.result.then(
      (result) => {
        // add this to the list of organization
        this.addPractitioner(result);
        if (formGroup && controlName) {
          //set this practitioner to the current select box
          formGroup
            .get(controlName)
            .setValue(generateReferenceUriFromResourceOrReference(result.data));
        }
      },
      () => {}
    );
  }
  openOrganizationModal(formGroup?: AbstractControl, controlName?: string) {
    let disabledResourceIds = [];
    disabledResourceIds.push(
      ...(this.organizations?.value || []).map((org) => org.source_resource_id)
    );
    disabledResourceIds.push(
      ...(
        this.existingEncounter?.related_resources?.['Organization'] || []
      ).map((org) => org.source_resource_id)
    );

    let modalRef = this.modalService.open(
      MedicalRecordWizardAddOrganizationComponent,
      {
        ariaLabelledBy: 'modal-organization',
        size: 'lg',
      }
    );
    modalRef.componentInstance.debugMode = this.debugMode;
    modalRef.componentInstance.disabledResourceIds = disabledResourceIds;
    modalRef.result.then(
      (result) => {
        //add this to the list of organization
        this.addOrganization(result);
        if (formGroup && controlName) {
          //set this practitioner to the current select box
          formGroup
            .get(controlName)
            .setValue(generateReferenceUriFromResourceOrReference(result.data));
        }
      },
      () => {}
    );
  }
  openLabResultsModal() {
    let modalRef = this.modalService.open(
      MedicalRecordWizardAddLabResultsComponent,
      {
        ariaLabelledBy: 'modal-labresults',
        size: 'lg',
      }
    );
    modalRef.componentInstance.debugMode = this.debugMode;
    modalRef.result.then(
      (result) => {
        //add this to the list of organization
        this.addLabResultsBundle(result);
      },
      () => {}
    );
  }
  openAttachmentModal(formGroup?: AbstractControl, controlName?: string) {
    let modalRef = this.modalService.open(
      MedicalRecordWizardAddAttachmentComponent,
      {
        ariaLabelledBy: 'modal-attachment',
        size: 'lg',
      }
    );
    modalRef.componentInstance.debugMode = this.debugMode;
    modalRef.result.then(
      (result) => {
        //add this to the list of organization
        result.id = uuidV4();
        this.addAttachment(result);

        if (formGroup && controlName) {
          //add this attachment id to the current FormArray
          let controlArrayVal = formGroup.get(controlName).getRawValue();
          controlArrayVal.push(result.id);
          formGroup.get(controlName).setValue(controlArrayVal);
        }
      },
      () => {}
    );
  }

  //</editor-fold>
  openEditMedicationModal(medication: MedicationModel) {
    let modalRef = this.modalService.open(
      MedicalRecordWizardEditMedicationComponent,
      {
        ariaLabelledBy: 'modal-edit-medication',
        size: 'lg',
      }
    );
    modalRef.componentInstance.debugMode = this.debugMode;
    modalRef.componentInstance.medication = medication;
    modalRef.componentInstance.practitioners =
      this.existingEncounter?.related_resources?.['Practitioner'];

    let medicationRequest = this.existingEncounter?.related_resources?.[
      'MedicationRequest'
    ].find((medicationRequest) => {
      return (
        (medicationRequest as MedicationRequestModel).medication_reference
          .reference === `Medication/${medication.source_resource_id}`
      );
    });
    modalRef.componentInstance.medicationRequest = medicationRequest;
    modalRef.result.then((result) => {
      let medication = UpdateMedicationToR4Medication(result.medication);
      this.fastenApi
        .updateResource(
          result.medication.source_resource_type,
          result.medication.source_resource_id,
          {
            resource_raw: medication,
            sort_title: result.medication.sort_title,
            sort_date: result.medication.sort_date,
          }
        )
        .subscribe();

      let medicationRequest = UpdateMedicationRequestToR4MedicationRequest(
        result.medicationRequest,
        result.medication
      );
      this.fastenApi
        .updateResource(
          result.medicationRequest.source_resource_type,
          result.medicationRequest.source_resource_id,
          {
            resource_raw: medicationRequest,
            sort_title: result.medicationRequest.sort_title,
            sort_date: result.medicationRequest.sort_date,
          }
        )
        .subscribe();
    });
  }
  openEditPractitionerModal(practitioner: PractitionerModel) {
    let modalRef = this.modalService.open(
      MedicalRecordWizardEditPractitionerComponent,
      {
        ariaLabelledBy: 'modal-edit-practitioner',
        size: 'lg',
      }
    );
    modalRef.componentInstance.debugMode = this.debugMode;
    modalRef.componentInstance.practitioner = practitioner;
    modalRef.result.then((result) => {
      let practitioner = PractitionerToR4Practitioner(result);

      this.fastenApi
        .updateResource(
          result.source_resource_type,
          result.source_resource_id,
          {
            resource_raw: practitioner,
            sort_title: result.sort_title,
          }
        )
        .subscribe();
    });
  }
  openEditProcedureModal(procedure: ProcedureModel) {
    let modalRef = this.modalService.open(
      MedicalRecordWizardEditProcedureComponent,
      {
        ariaLabelledBy: 'modal-edit-procedure',
        size: 'lg',
      }
    );
    modalRef.componentInstance.debugMode = this.debugMode;
    modalRef.componentInstance.procedure = procedure;
    modalRef.componentInstance.practitioners =
      this.existingEncounter?.related_resources?.['Practitioner'];
    modalRef.componentInstance.organizations =
      this.existingEncounter?.related_resources?.['Organization'];
    modalRef.result.then((result) => {
      let procedure = UpdateProcedureToR4Procedure(result);

      this.fastenApi
        .updateResource(
          result.source_resource_type,
          result.source_resource_id,
          {
            resource_raw: procedure,
            sort_title: result.sort_title,
            sort_date: result.performed_datetime,
          }
        )
        .subscribe();
    });
  }
  openEditOrganizationModal(organization: OrganizationModel) {
    let modalRef = this.modalService.open(
      MedicalRecordWizardEditOrganizationComponent,
      {
        ariaLabelledBy: 'modal-edit-organization',
        size: 'lg',
      }
    );
    modalRef.componentInstance.debugMode = this.debugMode;
    modalRef.componentInstance.organization = organization;
    modalRef.result.then((result) => {
      let organization = OrganizationToR4Organization(result);

      this.fastenApi
        .updateResource(
          result.source_resource_type,
          result.source_resource_id,
          {
            resource_raw: organization,
            sort_title: result.sort_title,
          }
        )
        .subscribe();
    });
  }
  openEditLabResultsModal(diagnosticReport: DiagnosticReportModel) {
    this.fastenApi
      .getResourceGraph(null, [
        {
          source_resource_type: diagnosticReport.source_resource_type,
          source_resource_id: diagnosticReport.source_resource_id,
          source_id: diagnosticReport.source_id,
        },
      ])
      .subscribe((graphResponse) => {
        if (graphResponse.results['DiagnosticReport']?.[0]) {
          let parsed = RecResourceRelatedDisplayModel(
            graphResponse.results['DiagnosticReport']?.[0]
          );
          let observations = (parsed.displayModel as DiagnosticReportModel)
            .related_resources?.['Observation'] as ObservationModel[];

          let modalRef = this.modalService.open(
            MedicalRecordWizardEditLabResultsComponent,
            {
              ariaLabelledBy: 'modal-edit-lab-results',
              size: 'lg',
            }
          );
          modalRef.componentInstance.debugMode = this.debugMode;
          modalRef.componentInstance.diagnosticReport = diagnosticReport;
          modalRef.componentInstance.observations = observations;
          modalRef.result.then((result) => {
            result.forEach((val) => {
              this.fastenApi
                .updateResource(
                  val.observation.source_resource_type,
                  val.observation.source_resource_id,
                  {
                    resource_raw: val.resourceRaw,
                  }
                )
                .subscribe();
            });
          });
        }
      });
  }
  onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.valid) {
      this.submitWizardLoading = true;

      let resourceStorage = GenerateR4ResourceLookup(this.form.getRawValue());

      //generate a ndjson file from the resourceList
      //make sure we extract the encounter resource

      let fhirListResource = {
        resourceType: 'List',
        entry: [],
        encounter: null,
        contained: [],
      } as List;

      let encounter = null;
      for (let resourceType in resourceStorage) {
        if (resourceType === 'Encounter') {
          //set the encounter to the first encounter
          let [encounterId] = Object.keys(resourceStorage[resourceType]);
          encounter = resourceStorage[resourceType][encounterId];

          if (!(encounter.type && encounter.reference)) {
            //this is not a reference
            fhirListResource.contained.push(encounter);
          }
          continue;
        }

        for (let resourceId in resourceStorage[resourceType]) {
          let resourceFromStorage = resourceStorage[resourceType][resourceId];
          if (
            (resourceFromStorage as Reference).type &&
            (resourceFromStorage as Reference).reference
          ) {
            //this is a reference
            fhirListResource.entry.push({
              item: {
                reference:
                  generateReferenceUriFromResourceOrReference(
                    resourceFromStorage
                  ),
              },
            });
          } else {
            //this is not a reference
            fhirListResource.contained.push(
              resourceFromStorage as FhirResource
            );
          }
        }
      }

      //set the encounter reference
      fhirListResource.encounter = {
        reference: generateReferenceUriFromResourceOrReference(encounter),
      };

      this.fastenApi
        .createRelatedResourcesFastenSource(fhirListResource)
        .subscribe(
          (resp) => {
            this.submitWizardLoading = false;
          },
          (err) => {
            this.submitWizardLoading = false;
          }
        );
    }

    // Redirect user to /medical-history after successful submission
    this.router.navigate(['/medical-history']);
  }

  //<editor-fold desc="Helpers">
  private deepClone(obj: any): any {
    if (!obj) return obj;
    return JSON.parse(JSON.stringify(obj));
  }
  //</editor-fold>

  handleUnlinkRequested(model: FastenDisplayModel) {
    const modalRef = this.modalService.open(ConfirmationModalComponent, {
      ariaLabelledBy: 'modal-confirmation',
      size: 'sm',
    });

    modalRef.componentInstance.message = `Are you sure you want to delete this resource from the encounter?`;
    modalRef.componentInstance.title = 'Delete Resource';

    modalRef.result.then((result) => {
      if (result == true) {
        this.submitWizardLoading = true;
        const encounterId = this.existingEncounter.source_resource_id;
        const resourceId = model.source_resource_id;
        const resourceType = model.source_resource_type;

        const indexOf =
          this.existingEncounter.related_resources[resourceType].indexOf(model);
        this.existingEncounter.related_resources[resourceType].splice(
          indexOf,
          1
        );

        this.fastenApi
          .removeEncounterRelatedResource(encounterId, resourceId, resourceType)
          .subscribe(
            (resp) => {
              this.submitWizardLoading = false;
            },
            (err) => {
              this.submitWizardLoading = false;
            }
          );
      }
    });
  }
}
