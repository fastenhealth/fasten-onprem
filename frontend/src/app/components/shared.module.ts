import { ComponentsSidebarComponent } from './components-sidebar/components-sidebar.component';
import { ListGenericResourceComponent,} from './list-generic-resource/list-generic-resource.component';
import { ListPatientComponent } from './list-patient/list-patient.component';
import { NgModule } from '@angular/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { RouterModule } from '@angular/router';
import { UtilitiesSidebarComponent } from './utilities-sidebar/utilities-sidebar.component';
import {BrowserModule} from '@angular/platform-browser';
import {ListAdverseEventComponent} from './list-generic-resource/list-adverse-event.component';
import {ListConditionComponent} from './list-generic-resource/list-condition.component'
import {ListEncounterComponent} from './list-generic-resource/list-encounter.component'
import {ListImmunizationComponent} from './list-generic-resource/list-immunization.component'
import {ListMedicationAdministrationComponent} from './list-generic-resource/list-medication-administration.component';
import {ListMedicationComponent} from './list-generic-resource/list-medication.component'
import {ListMedicationDispenseComponent} from './list-generic-resource/list-medication-dispense.component';
import {ListMedicationRequestComponent} from './list-generic-resource/list-medication-request.component'
import {ListNutritionOrderComponent} from './list-generic-resource/list-nutrition-order.component';
import {ListObservationComponent} from './list-generic-resource/list-observation.component'
import {ListProcedureComponent} from './list-generic-resource/list-procedure.component'
import {ListCommunicationComponent} from './list-generic-resource/list-communication.component';
import {ListDeviceRequestComponent} from './list-generic-resource/list-device-request.component';
import {ListCoverageComponent} from './list-generic-resource/list-coverage.component';
import {ListServiceRequestComponent} from './list-generic-resource/list-service-request.component';
import {ListDocumentReferenceComponent} from './list-generic-resource/list-document-reference.component';
import { ResourceListComponent } from './resource-list/resource-list.component';
import {ListCarePlanComponent} from './list-generic-resource/list-care-plan.component';
import {ListAllergyIntoleranceComponent} from './list-generic-resource/list-allergy-intolerance.component';
import {ResourceListOutletDirective} from './resource-list/resource-list-outlet.directive';
import {ListAppointmentComponent} from './list-generic-resource/list-appointment.component';
import {ListDeviceComponent} from './list-generic-resource/list-device.component';
import {ListDiagnosticReportComponent} from './list-generic-resource/list-diagnostic-report.component';
import {ListGoalComponent} from './list-generic-resource/list-goal.component';
import { ListFallbackResourceComponent } from './list-fallback-resource/list-fallback-resource.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { ToastComponent } from './toast/toast.component';
import { MomentModule } from 'ngx-moment';
import { ReportHeaderComponent } from './report-header/report-header.component';
import { FhirPathPipe } from '../pipes/fhir-path.pipe';
import { ReportMedicalHistoryEditorComponent } from './report-medical-history-editor/report-medical-history-editor.component';
import { TreeModule } from '@circlon/angular-tree-component';
import {FilterPipe} from '../pipes/filter.pipe';
import { ReportMedicalHistoryConditionComponent } from './report-medical-history-condition/report-medical-history-condition.component';
import { ReportLabsObservationComponent } from './report-labs-observation/report-labs-observation.component';
import { ChartsModule } from 'ng2-charts';

@NgModule({
  imports: [
    RouterModule,
    BrowserModule,
    NgxDatatableModule,
    NgbModule,
    MomentModule,
    TreeModule,
    ChartsModule
  ],
  declarations: [
    ComponentsSidebarComponent,
    UtilitiesSidebarComponent,
    ListAllergyIntoleranceComponent,
    ListAdverseEventComponent,
    ListCarePlanComponent,
    ListCommunicationComponent,
    ListConditionComponent,
    ListEncounterComponent,
    ListGenericResourceComponent,
    ListImmunizationComponent,
    ListMedicationAdministrationComponent,
    ListMedicationComponent,
    ListMedicationDispenseComponent,
    ListMedicationRequestComponent,
    ListNutritionOrderComponent,
    ListObservationComponent,
    ListPatientComponent,
    ListDeviceRequestComponent,
    ListProcedureComponent,
    ListCoverageComponent,
    ListServiceRequestComponent,
    ListDocumentReferenceComponent,
    ListAppointmentComponent,
    ListDeviceComponent,
    ListDiagnosticReportComponent,
    ListGoalComponent,
    ResourceListComponent,
    ResourceListOutletDirective,
    ListFallbackResourceComponent,
    ToastComponent,
    ReportHeaderComponent,
    FhirPathPipe,
    ReportMedicalHistoryEditorComponent,
    FilterPipe,
    ReportMedicalHistoryConditionComponent,
    ReportLabsObservationComponent,
  ],
    exports: [
        ComponentsSidebarComponent,
        ListAllergyIntoleranceComponent,
        ListAdverseEventComponent,
        ListCarePlanComponent,
        ListCommunicationComponent,
        ListConditionComponent,
        ListEncounterComponent,
        ListAppointmentComponent,
        ListGenericResourceComponent,
        ListImmunizationComponent,
        ListMedicationAdministrationComponent,
        ListMedicationComponent,
        ListMedicationDispenseComponent,
        ListMedicationRequestComponent,
        ListNutritionOrderComponent,
        ListObservationComponent,
        ListPatientComponent,
        ListProcedureComponent,
        ListDeviceRequestComponent,
        UtilitiesSidebarComponent,
        ListCoverageComponent,
        ListServiceRequestComponent,
        ListDocumentReferenceComponent,
        ListDeviceComponent,
        ListDiagnosticReportComponent,
        ListGoalComponent,
        ResourceListComponent,
        ResourceListOutletDirective,
        ToastComponent,
        ReportHeaderComponent,
        ReportMedicalHistoryEditorComponent,
        FhirPathPipe,
        FilterPipe,
        ReportMedicalHistoryConditionComponent,
        ReportLabsObservationComponent

    ]
})

export class SharedModule { }
