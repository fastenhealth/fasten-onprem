import { ComponentsSidebarComponent } from './components-sidebar/components-sidebar.component';
import { ListGenericResourceComponent,} from './list-generic-resource/list-generic-resource.component';
import { ListPatientComponent } from './list-patient/list-patient.component';
import { NgModule } from '@angular/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { RouterModule } from '@angular/router';
import { UtilitiesSidebarComponent } from './utilities-sidebar/utilities-sidebar.component';
import {BrowserModule} from '@angular/platform-browser';
import { AllergyIntoleranceComponent } from './fhir/resources/allergy-intolerance/allergy-intolerance.component';
import { BadgeComponent } from './fhir/common/badge/badge.component';
import { BinaryComponent } from './fhir/resources/binary/binary.component';
import { BinaryTextComponent } from './fhir/datatypes/binary-text/binary-text.component';
import { CodableConceptComponent } from './fhir/datatypes/codable-concept/codable-concept.component';
import { CodingComponent } from './fhir/datatypes/coding/coding.component';
import { DiagnosticReportComponent } from './fhir/resources/diagnostic-report/diagnostic-report.component';
import { DicomComponent } from './fhir/datatypes/dicom/dicom.component';
import { DocumentReferenceComponent } from './fhir/resources/document-reference/document-reference.component';
import { FallbackComponent } from './fhir/resources/fallback/fallback.component';
import { FhirResourceComponent } from './fhir/fhir-resource/fhir-resource.component';
import { FhirResourceOutletDirective } from './fhir/fhir-resource/fhir-resource-outlet.directive';
import { GlossaryLookupComponent } from './glossary-lookup/glossary-lookup.component';
import { HtmlComponent } from './fhir/datatypes/html/html.component';
import { ImgComponent } from './fhir/datatypes/img/img.component';
import { ImmunizationComponent } from './fhir/resources/immunization/immunization.component';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { MarkdownComponent } from './fhir/datatypes/markdown/markdown.component';
import { MediaComponent } from './fhir/resources/media/media.component';
import { MedicalSourcesCardComponent } from './medical-sources-card/medical-sources-card.component';
import { MedicalSourcesCategoryLookupPipe } from './medical-sources-filter/medical-sources-category-lookup.pipe';
import { MedicalSourcesConnectedComponent } from './medical-sources-connected/medical-sources-connected.component';
import { MedicalSourcesFilterComponent } from './medical-sources-filter/medical-sources-filter.component';
import { MedicationComponent } from './fhir/resources/medication/medication.component';
import { MedicationRequestComponent } from './fhir/resources/medication-request/medication-request.component';
import { MomentModule } from 'ngx-moment';
import { NgChartsModule } from 'ng2-charts';
import { NlmTypeaheadComponent } from './nlm-typeahead/nlm-typeahead.component';
import { PdfComponent } from './fhir/datatypes/pdf/pdf.component';
import { PractitionerComponent } from './fhir/resources/practitioner/practitioner.component';
import { ProcedureComponent } from './fhir/resources/procedure/procedure.component';
import { ReportHeaderComponent } from './report-header/report-header.component';
import { ReportLabsObservationComponent } from './report-labs-observation/report-labs-observation.component';
import { ReportMedicalHistoryConditionComponent } from './report-medical-history-condition/report-medical-history-condition.component';
import { ReportMedicalHistoryEditorComponent } from './report-medical-history-editor/report-medical-history-editor.component';
import { ReportMedicalHistoryExplanationOfBenefitComponent } from './report-medical-history-explanation-of-benefit/report-medical-history-explanation-of-benefit.component';
import { ResourceListComponent } from './resource-list/resource-list.component';
import { TableComponent } from './fhir/common/table/table.component';
import { ToastComponent } from './toast/toast.component';
import { TreeModule } from '@circlon/angular-tree-component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {GridstackComponent} from './gridstack/gridstack.component';
import {GridstackItemComponent} from './gridstack/gridstack-item.component';
import {HighlightModule} from 'ngx-highlightjs';
import {ListAdverseEventComponent} from './list-generic-resource/list-adverse-event.component';
import {ListAllergyIntoleranceComponent} from './list-generic-resource/list-allergy-intolerance.component';
import {ListAppointmentComponent} from './list-generic-resource/list-appointment.component';
import {ListBinaryComponent} from './list-generic-resource/list-binary.component';
import {ListCarePlanComponent} from './list-generic-resource/list-care-plan.component';
import {ListCareTeamComponent} from './list-generic-resource/list-care-team.component';
import {ListCommunicationComponent} from './list-generic-resource/list-communication.component';
import {ListConditionComponent} from './list-generic-resource/list-condition.component'
import {ListCoverageComponent} from './list-generic-resource/list-coverage.component';
import {ListDeviceComponent} from './list-generic-resource/list-device.component';
import {ListDeviceRequestComponent} from './list-generic-resource/list-device-request.component';
import {ListDiagnosticReportComponent} from './list-generic-resource/list-diagnostic-report.component';
import {ListDocumentReferenceComponent} from './list-generic-resource/list-document-reference.component';
import {ListEncounterComponent} from './list-generic-resource/list-encounter.component'
import {ListFallbackComponent} from './list-generic-resource/list-fallback.component'
import {ListGoalComponent} from './list-generic-resource/list-goal.component';
import {ListImmunizationComponent} from './list-generic-resource/list-immunization.component'
import {ListLocationComponent} from './list-generic-resource/list-location.component'
import {ListMedicationAdministrationComponent} from './list-generic-resource/list-medication-administration.component';
import {ListMedicationComponent} from './list-generic-resource/list-medication.component'
import {ListMedicationDispenseComponent} from './list-generic-resource/list-medication-dispense.component';
import {ListMedicationRequestComponent} from './list-generic-resource/list-medication-request.component'
import {ListNutritionOrderComponent} from './list-generic-resource/list-nutrition-order.component';
import {ListObservationComponent} from './list-generic-resource/list-observation.component'
import {ListOrganizationComponent} from './list-generic-resource/list-organization.component'
import {ListPractitionerComponent} from './list-generic-resource/list-practitioner.component'
import {ListProcedureComponent} from './list-generic-resource/list-procedure.component'
import {ListServiceRequestComponent} from './list-generic-resource/list-service-request.component';
import {NgbCollapseModule, NgbModule, NgbDropdownModule, NgbAccordionModule} from '@ng-bootstrap/ng-bootstrap';
import {PipesModule} from '../pipes/pipes.module';
import {ResourceListOutletDirective} from './resource-list/resource-list-outlet.directive';
import {DirectivesModule} from '../directives/directives.module';
import { ReportMedicalHistoryTimelinePanelComponent } from './report-medical-history-timeline-panel/report-medical-history-timeline-panel.component';

@NgModule({
  imports: [
    RouterModule,
    BrowserModule,
    NgxDatatableModule,
    NgbModule,
    NgbDropdownModule,
    NgbCollapseModule,
    NgbAccordionModule,
    FormsModule,
    ReactiveFormsModule,
    MomentModule,
    TreeModule,
    NgChartsModule,
    HighlightModule,
    PipesModule,
    DirectivesModule,

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
    DicomComponent,
    BinaryComponent,
    GridstackComponent,
    GridstackItemComponent,
    CodableConceptComponent

  ],
  declarations: [
    ComponentsSidebarComponent,
    UtilitiesSidebarComponent,
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
    ToastComponent,
    ReportHeaderComponent,
    ReportMedicalHistoryEditorComponent,
    ReportMedicalHistoryConditionComponent,
    ReportLabsObservationComponent,
    ReportMedicalHistoryTimelinePanelComponent,

    FhirResourceComponent,
    FhirResourceOutletDirective,
    FallbackComponent,
    ListFallbackComponent,
    DiagnosticReportComponent,
    NlmTypeaheadComponent,
    DocumentReferenceComponent,
    MediaComponent,
    ReportMedicalHistoryExplanationOfBenefitComponent,
    MedicalSourcesFilterComponent,
    MedicalSourcesConnectedComponent,
    MedicalSourcesCategoryLookupPipe,
    MedicalSourcesCardComponent,
  ],
    exports: [
        BinaryComponent,
        ComponentsSidebarComponent,
        DiagnosticReportComponent,
        DocumentReferenceComponent,
        FallbackComponent,
        ListFallbackComponent,
        FhirResourceComponent,
        FhirResourceOutletDirective,
        ImmunizationComponent,
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
        MedicalSourcesFilterComponent,
        MedicationRequestComponent,
        NlmTypeaheadComponent,
        PractitionerComponent,
        ProcedureComponent,
        ReportHeaderComponent,
        ReportLabsObservationComponent,
        ReportMedicalHistoryConditionComponent,
        ReportMedicalHistoryEditorComponent,
        ReportMedicalHistoryExplanationOfBenefitComponent,
        ResourceListComponent,
        ResourceListOutletDirective,
        ToastComponent,
        UtilitiesSidebarComponent,
        MedicalSourcesCardComponent,
        MedicalSourcesConnectedComponent,
        ReportMedicalHistoryTimelinePanelComponent,

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
        BinaryComponent,
        GridstackComponent,
        GridstackItemComponent,
        MedicalSourcesCategoryLookupPipe,
        CodableConceptComponent,

    ]
})

export class SharedModule { }
