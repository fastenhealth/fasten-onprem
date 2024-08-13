import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {DatatableAdverseEventComponent} from './datatable-generic-resource/datatable-adverse-event.component';
import {DatatableCarePlanComponent} from './datatable-generic-resource/datatable-care-plan.component';
import {DatatableAppointmentComponent} from './datatable-generic-resource/datatable-appointment.component';
import {DatatableBinaryComponent} from './datatable-generic-resource/datatable-binary.component';
import {DatatableAllergyIntoleranceComponent} from './datatable-generic-resource/datatable-allergy-intolerance.component';
import {DatatableCareTeamComponent} from './datatable-generic-resource/datatable-care-team.component';
import {DatatableCommunicationComponent} from './datatable-generic-resource/datatable-communication.component';
import {DatatableConditionComponent} from './datatable-generic-resource/datatable-condition.component';
import {DatatableCoverageComponent} from './datatable-generic-resource/datatable-coverage.component';
import {DatatableDeviceComponent} from './datatable-generic-resource/datatable-device.component';
import {DatatableDeviceRequestComponent} from './datatable-generic-resource/datatable-device-request.component';
import {DatatableDiagnosticReportComponent} from './datatable-generic-resource/datatable-diagnostic-report.component';
import {DatatableDocumentReferenceComponent} from './datatable-generic-resource/datatable-document-reference.component';
import {DatatableEncounterComponent} from './datatable-generic-resource/datatable-encounter.component';
import {DatatableGenericResourceComponent} from './datatable-generic-resource/datatable-generic-resource.component';
import {DatatableGoalComponent} from './datatable-generic-resource/datatable-goal.component';
import {DatatableImmunizationComponent} from './datatable-generic-resource/datatable-immunization.component';
import {DatatableLocationComponent} from './datatable-generic-resource/datatable-location.component';
import {DatatableMedicationAdministrationComponent} from './datatable-generic-resource/datatable-medication-administration.component';
import {DatatableMedicationComponent} from './datatable-generic-resource/datatable-medication.component';
import {DatatableMedicationDispenseComponent} from './datatable-generic-resource/datatable-medication-dispense.component';
import {DatatableMedicationRequestComponent} from './datatable-generic-resource/datatable-medication-request.component';
import {DatatableNutritionOrderComponent} from './datatable-generic-resource/datatable-nutrition-order.component';
import {DatatableObservationComponent} from './datatable-generic-resource/datatable-observation.component';
import {DatatableOrganizationComponent} from './datatable-generic-resource/datatable-organization.component';
import {DatatablePatientComponent} from './datatable-generic-resource/datatable-patient.component';
import {DatatablePractitionerComponent} from './datatable-generic-resource/datatable-practitioner.component';
import {DatatableProcedureComponent} from './datatable-generic-resource/datatable-procedure.component';
import {DatatableServiceRequestComponent} from './datatable-generic-resource/datatable-service-request.component';
import {FhirDatatableComponent} from './fhir-datatable/fhir-datatable.component';
import {FhirDatatableOutletDirective} from './fhir-datatable/fhir-datatable-outlet.directive';
import {DatatableFallbackComponent} from './datatable-generic-resource/datatable-fallback.component';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';

@NgModule({
  imports: [
    CommonModule,
    NgxDatatableModule,
  ],
  declarations: [
    DatatableAdverseEventComponent,
    DatatableAllergyIntoleranceComponent,
    DatatableAppointmentComponent,
    DatatableBinaryComponent,
    DatatableCarePlanComponent,
    DatatableCareTeamComponent,
    DatatableCommunicationComponent,
    DatatableConditionComponent,
    DatatableCoverageComponent,
    DatatableDeviceComponent,
    DatatableDeviceRequestComponent,
    DatatableDiagnosticReportComponent,
    DatatableDocumentReferenceComponent,
    DatatableEncounterComponent,
    DatatableGenericResourceComponent,
    DatatableGoalComponent,
    DatatableImmunizationComponent,
    DatatableLocationComponent,
    DatatableMedicationAdministrationComponent,
    DatatableMedicationComponent,
    DatatableMedicationDispenseComponent,
    DatatableMedicationRequestComponent,
    DatatableNutritionOrderComponent,
    DatatableObservationComponent,
    DatatableOrganizationComponent,
    DatatablePatientComponent,
    DatatablePractitionerComponent,
    DatatableProcedureComponent,
    DatatableServiceRequestComponent,
    FhirDatatableComponent,
    FhirDatatableOutletDirective,
    DatatableFallbackComponent,
  ],
  exports: [
    DatatableAdverseEventComponent,
    DatatableAllergyIntoleranceComponent,
    DatatableAppointmentComponent,
    DatatableBinaryComponent,
    DatatableCarePlanComponent,
    DatatableCareTeamComponent,
    DatatableCommunicationComponent,
    DatatableConditionComponent,
    DatatableCoverageComponent,
    DatatableDeviceComponent,
    DatatableDeviceRequestComponent,
    DatatableDiagnosticReportComponent,
    DatatableDocumentReferenceComponent,
    DatatableEncounterComponent,
    DatatableGenericResourceComponent,
    DatatableGoalComponent,
    DatatableImmunizationComponent,
    DatatableLocationComponent,
    DatatableMedicationAdministrationComponent,
    DatatableMedicationComponent,
    DatatableMedicationDispenseComponent,
    DatatableMedicationRequestComponent,
    DatatableNutritionOrderComponent,
    DatatableObservationComponent,
    DatatableOrganizationComponent,
    DatatablePatientComponent,
    DatatablePractitionerComponent,
    DatatableProcedureComponent,
    DatatableServiceRequestComponent,
    FhirDatatableComponent,
    FhirDatatableOutletDirective,
    DatatableFallbackComponent,
  ]
})
export class FhirDatatableModule { }
