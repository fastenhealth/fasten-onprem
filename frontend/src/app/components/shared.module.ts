import { ComponentsSidebarComponent } from './components-sidebar/components-sidebar.component';
import { ListGenericResourceComponent,} from './list-generic-resource/list-generic-resource.component';
import { ListPatientComponent } from './list-patient/list-patient.component';
import { NgModule } from '@angular/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { RouterModule } from '@angular/router';
import { UtilitiesSidebarComponent } from './utilities-sidebar/utilities-sidebar.component';
import {BrowserModule} from '@angular/platform-browser';
import { GlossaryLookupComponent } from './glossary-lookup/glossary-lookup.component';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { MedicalSourcesCardComponent } from './medical-sources-card/medical-sources-card.component';
import { MedicalSourcesCategoryLookupPipe } from './medical-sources-filter/medical-sources-category-lookup.pipe';
import { MedicalSourcesConnectedComponent } from './medical-sources-connected/medical-sources-connected.component';
import { MedicalSourcesFilterComponent } from './medical-sources-filter/medical-sources-filter.component';
import { MomentModule } from 'ngx-moment';
import { NgChartsModule } from 'ng2-charts';
import { NlmTypeaheadComponent } from './nlm-typeahead/nlm-typeahead.component';
import { ReportHeaderComponent } from './report-header/report-header.component';
import { ReportLabsObservationComponent } from './report-labs-observation/report-labs-observation.component';
import { ReportMedicalHistoryConditionComponent } from './report-medical-history-condition/report-medical-history-condition.component';
import { ReportMedicalHistoryEditorComponent } from './report-medical-history-editor/report-medical-history-editor.component';
import { ReportMedicalHistoryExplanationOfBenefitComponent } from './report-medical-history-explanation-of-benefit/report-medical-history-explanation-of-benefit.component';
import { ResourceListComponent } from './resource-list/resource-list.component';
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
import {NgbCollapseModule, NgbModule, NgbDropdownModule, NgbAccordionModule, NgbNavModule} from '@ng-bootstrap/ng-bootstrap';
import {PipesModule} from '../pipes/pipes.module';
import {ResourceListOutletDirective} from './resource-list/resource-list-outlet.directive';
import {DirectivesModule} from '../directives/directives.module';
import { ReportMedicalHistoryTimelinePanelComponent } from './report-medical-history-timeline-panel/report-medical-history-timeline-panel.component';
import { MedicalRecordWizardComponent } from './medical-record-wizard/medical-record-wizard.component';
import { MedicalRecordWizardAddPractitionerComponent } from './medical-record-wizard-add-practitioner/medical-record-wizard-add-practitioner.component';
import { MedicalRecordWizardAddOrganizationComponent } from './medical-record-wizard-add-organization/medical-record-wizard-add-organization.component';
import { MedicalRecordWizardAddAttachmentComponent } from './medical-record-wizard-add-attachment/medical-record-wizard-add-attachment.component';
import {FhirCardModule} from './fhir-card/fhir-card.module';

@NgModule({
  imports: [
    RouterModule,
    BrowserModule,
    NgxDatatableModule,
    NgbModule,
    NgbDropdownModule,
    NgbCollapseModule,
    NgbAccordionModule,
    NgbNavModule,
    FormsModule,
    ReactiveFormsModule,
    MomentModule,
    TreeModule,
    NgChartsModule,
    HighlightModule,
    PipesModule,
    DirectivesModule,
    FhirCardModule,

    //standalone components
    GlossaryLookupComponent,
    GridstackComponent,
    GridstackItemComponent,
    LoadingSpinnerComponent,
    MedicalRecordWizardComponent,
    NlmTypeaheadComponent,
    MedicalRecordWizardAddPractitionerComponent,
    MedicalRecordWizardAddOrganizationComponent,
    MedicalRecordWizardAddAttachmentComponent,

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

    ListFallbackComponent,
    ReportMedicalHistoryExplanationOfBenefitComponent,
    MedicalSourcesFilterComponent,
    MedicalSourcesConnectedComponent,
    MedicalSourcesCategoryLookupPipe,
    MedicalSourcesCardComponent,
  ],
    exports: [
        ComponentsSidebarComponent,
        ListFallbackComponent,
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
        NlmTypeaheadComponent,
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
        GlossaryLookupComponent,
        GridstackComponent,
        GridstackItemComponent,
        LoadingSpinnerComponent,
        MedicalSourcesCategoryLookupPipe,
        MedicalRecordWizardComponent,
        NlmTypeaheadComponent,
        MedicalRecordWizardAddPractitionerComponent,
        MedicalRecordWizardAddOrganizationComponent,
        MedicalRecordWizardAddAttachmentComponent,

    ]
})

export class SharedModule { }
