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
import {NgbCollapseModule, NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { ToastComponent } from './toast/toast.component';
import { MomentModule } from 'ngx-moment';
import { ReportHeaderComponent } from './report-header/report-header.component';
import { ReportMedicalHistoryEditorComponent } from './report-medical-history-editor/report-medical-history-editor.component';
import { TreeModule } from '@circlon/angular-tree-component';
import { ReportMedicalHistoryConditionComponent } from './report-medical-history-condition/report-medical-history-condition.component';
import { ReportLabsObservationComponent } from './report-labs-observation/report-labs-observation.component';
import { ChartsModule } from 'ng2-charts';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { BinaryComponent } from './fhir/resources/binary/binary.component';
import { PdfComponent } from './fhir/datatypes/pdf/pdf.component';
import { ImgComponent } from './fhir/datatypes/img/img.component';
import { BinaryTextComponent } from './fhir/datatypes/binary-text/binary-text.component';
import { MarkdownComponent } from './fhir/datatypes/markdown/markdown.component';
import { HtmlComponent } from './fhir/datatypes/html/html.component';
import { FhirResourceComponent } from './fhir/fhir-resource/fhir-resource.component';
import { FhirResourceOutletDirective } from './fhir/fhir-resource/fhir-resource-outlet.directive';
import { FallbackComponent } from './fhir/resources/fallback/fallback.component';
import {HighlightModule} from 'ngx-highlightjs';
import { ImmunizationComponent } from './fhir/resources/immunization/immunization.component';
import { BadgeComponent } from './fhir/common/badge/badge.component';
import { TableComponent } from './fhir/common/table/table.component';
import { CodingComponent } from './fhir/datatypes/coding/coding.component';
import { AllergyIntoleranceComponent } from './fhir/resources/allergy-intolerance/allergy-intolerance.component';
import { MedicationComponent } from './fhir/resources/medication/medication.component';
import { MedicationRequestComponent } from './fhir/resources/medication-request/medication-request.component';
import { ProcedureComponent } from './fhir/resources/procedure/procedure.component';
import { DiagnosticReportComponent } from './fhir/resources/diagnostic-report/diagnostic-report.component';
import { PractitionerComponent } from './fhir/resources/practitioner/practitioner.component';
import {PipesModule} from '../pipes/pipes.module';
import { NlmTypeaheadComponent } from './nlm-typeahead/nlm-typeahead.component';
import { DocumentReferenceComponent } from './fhir/resources/document-reference/document-reference.component';
import { DicomComponent } from './fhir/datatypes/dicom/dicom.component';
import { MediaComponent } from './fhir/resources/media/media.component';
import { GlossaryLookupComponent } from './glossary-lookup/glossary-lookup.component';
import { ReportMedicalHistoryExplanationOfBenefitComponent } from './report-medical-history-explanation-of-benefit/report-medical-history-explanation-of-benefit.component';

@NgModule({
  imports: [
    RouterModule,
    BrowserModule,
    NgxDatatableModule,
    NgbModule,
    NgbCollapseModule,
    FormsModule,
    ReactiveFormsModule,
    MomentModule,
    TreeModule,
    ChartsModule,
    HighlightModule,
    PipesModule,

    //standalone components
    LoadingSpinnerComponent,
    GlossaryLookupComponent,
    BadgeComponent,
    TableComponent,
    CodingComponent,
    AllergyIntoleranceComponent,
    MedicationComponent,
    MedicationRequestComponent,
    PractitionerComponent,
    ProcedureComponent,
    ImmunizationComponent,
    BinaryTextComponent,
    HtmlComponent,
    ImgComponent,
    PdfComponent,
    MarkdownComponent,

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
    ReportMedicalHistoryEditorComponent,
    ReportMedicalHistoryConditionComponent,
    ReportLabsObservationComponent,
    BinaryComponent,

    FhirResourceComponent,
    FhirResourceOutletDirective,
    FallbackComponent,
    DiagnosticReportComponent,
    NlmTypeaheadComponent,
    DocumentReferenceComponent,
    DicomComponent,
    MediaComponent,
    ReportMedicalHistoryExplanationOfBenefitComponent,
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
        ReportMedicalHistoryConditionComponent,
        ReportMedicalHistoryExplanationOfBenefitComponent,
        ReportLabsObservationComponent,
        BinaryComponent,
        FhirResourceComponent,
        FhirResourceOutletDirective,
        FallbackComponent,
        ImmunizationComponent,
        MedicationRequestComponent,
        ProcedureComponent,
        DiagnosticReportComponent,
        PractitionerComponent,
        NlmTypeaheadComponent,
        DocumentReferenceComponent,

      //standalone components
      BadgeComponent,
      TableComponent,
      CodingComponent,
      LoadingSpinnerComponent,
      GlossaryLookupComponent,
      AllergyIntoleranceComponent,
      MedicationComponent,
      MedicationRequestComponent,
      PractitionerComponent,
      ProcedureComponent,
      ImmunizationComponent,

    ]
})

export class SharedModule { }
