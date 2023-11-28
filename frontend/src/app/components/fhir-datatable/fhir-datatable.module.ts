import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ListAdverseEventComponent} from './list-generic-resource/list-adverse-event.component';
import {ListCarePlanComponent} from './list-generic-resource/list-care-plan.component';
import {ListAppointmentComponent} from './list-generic-resource/list-appointment.component';
import {ListBinaryComponent} from './list-generic-resource/list-binary.component';
import {ListAllergyIntoleranceComponent} from './list-generic-resource/list-allergy-intolerance.component';
import {ListCareTeamComponent} from './list-generic-resource/list-care-team.component';
import {ListCommunicationComponent} from './list-generic-resource/list-communication.component';
import {ListConditionComponent} from './list-generic-resource/list-condition.component';
import {ListCoverageComponent} from './list-generic-resource/list-coverage.component';
import {ListDeviceComponent} from './list-generic-resource/list-device.component';
import {ListDeviceRequestComponent} from './list-generic-resource/list-device-request.component';
import {ListDiagnosticReportComponent} from './list-generic-resource/list-diagnostic-report.component';
import {ListDocumentReferenceComponent} from './list-generic-resource/list-document-reference.component';
import {ListEncounterComponent} from './list-generic-resource/list-encounter.component';
import {ListGenericResourceComponent} from './list-generic-resource/list-generic-resource.component';
import {ListGoalComponent} from './list-generic-resource/list-goal.component';
import {ListImmunizationComponent} from './list-generic-resource/list-immunization.component';
import {ListLocationComponent} from './list-generic-resource/list-location.component';
import {ListMedicationAdministrationComponent} from './list-generic-resource/list-medication-administration.component';
import {ListMedicationComponent} from './list-generic-resource/list-medication.component';
import {ListMedicationDispenseComponent} from './list-generic-resource/list-medication-dispense.component';
import {ListMedicationRequestComponent} from './list-generic-resource/list-medication-request.component';
import {ListNutritionOrderComponent} from './list-generic-resource/list-nutrition-order.component';
import {ListObservationComponent} from './list-generic-resource/list-observation.component';
import {ListOrganizationComponent} from './list-generic-resource/list-organization.component';
import {ListPatientComponent} from './list-patient/list-patient.component';
import {ListPractitionerComponent} from './list-generic-resource/list-practitioner.component';
import {ListProcedureComponent} from './list-generic-resource/list-procedure.component';
import {ListServiceRequestComponent} from './list-generic-resource/list-service-request.component';
import {ResourceListComponent} from './resource-list/resource-list.component';
import {ResourceListOutletDirective} from './resource-list/resource-list-outlet.directive';
import {ListFallbackComponent} from './list-generic-resource/list-fallback.component';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';

@NgModule({
  imports: [
    CommonModule,
    NgxDatatableModule,
  ],
  declarations: [
    ListAdverseEventComponent,
    ListAllergyIntoleranceComponent,
    ListAppointmentComponent,
    ListBinaryComponent,
    ListCarePlanComponent,
    ListCareTeamComponent,
    ListCommunicationComponent,
    ListConditionComponent,
    ListCoverageComponent,
    ListDeviceComponent,
    ListDeviceRequestComponent,
    ListDiagnosticReportComponent,
    ListDocumentReferenceComponent,
    ListEncounterComponent,
    ListGenericResourceComponent,
    ListGoalComponent,
    ListImmunizationComponent,
    ListLocationComponent,
    ListMedicationAdministrationComponent,
    ListMedicationComponent,
    ListMedicationDispenseComponent,
    ListMedicationRequestComponent,
    ListNutritionOrderComponent,
    ListObservationComponent,
    ListOrganizationComponent,
    ListPatientComponent,
    ListPractitionerComponent,
    ListProcedureComponent,
    ListServiceRequestComponent,
    ResourceListComponent,
    ResourceListOutletDirective,
    ListFallbackComponent,
  ],
  exports: [
    ListAdverseEventComponent,
    ListAllergyIntoleranceComponent,
    ListAppointmentComponent,
    ListBinaryComponent,
    ListCarePlanComponent,
    ListCareTeamComponent,
    ListCommunicationComponent,
    ListConditionComponent,
    ListCoverageComponent,
    ListDeviceComponent,
    ListDeviceRequestComponent,
    ListDiagnosticReportComponent,
    ListDocumentReferenceComponent,
    ListEncounterComponent,
    ListGenericResourceComponent,
    ListGoalComponent,
    ListImmunizationComponent,
    ListLocationComponent,
    ListMedicationAdministrationComponent,
    ListMedicationComponent,
    ListMedicationDispenseComponent,
    ListMedicationRequestComponent,
    ListNutritionOrderComponent,
    ListObservationComponent,
    ListOrganizationComponent,
    ListPatientComponent,
    ListPractitionerComponent,
    ListProcedureComponent,
    ListServiceRequestComponent,
    ResourceListComponent,
    ResourceListOutletDirective,
    ListFallbackComponent,
  ]
})
export class FhirDatatableModule { }
