import { ComponentsSidebarComponent } from './components-sidebar/components-sidebar.component';
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
import { ReportMedicalHistoryExplanationOfBenefitComponent } from './report-medical-history-explanation-of-benefit/report-medical-history-explanation-of-benefit.component';
import { ToastComponent } from './toast/toast.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {GridstackComponent} from './gridstack/gridstack.component';
import {GridstackItemComponent} from './gridstack/gridstack-item.component';
import {HighlightModule} from 'ngx-highlightjs';
import {NgbCollapseModule, NgbModule, NgbDropdownModule, NgbAccordionModule, NgbNavModule} from '@ng-bootstrap/ng-bootstrap';
import {PipesModule} from '../pipes/pipes.module';
import {DirectivesModule} from '../directives/directives.module';
import { ReportMedicalHistoryTimelinePanelComponent } from './report-medical-history-timeline-panel/report-medical-history-timeline-panel.component';
import { MedicalRecordWizardComponent } from './medical-record-wizard/medical-record-wizard.component';
import { MedicalRecordWizardAddPractitionerComponent } from './medical-record-wizard-add-practitioner/medical-record-wizard-add-practitioner.component';
import { MedicalRecordWizardAddOrganizationComponent } from './medical-record-wizard-add-organization/medical-record-wizard-add-organization.component';
import { MedicalRecordWizardAddAttachmentComponent } from './medical-record-wizard-add-attachment/medical-record-wizard-add-attachment.component';
import {FhirCardModule} from './fhir-card/fhir-card.module';
import {FhirDatatableModule} from './fhir-datatable/fhir-datatable.module';
import { MedicalRecordWizardAddEncounterComponent } from './medical-record-wizard-add-encounter/medical-record-wizard-add-encounter.component';
import { MedicalRecordWizardAddLabResultsComponent } from './medical-record-wizard-add-lab-results/medical-record-wizard-add-lab-results.component';
import { FormRequestHealthSystemComponent } from './form-request-health-system/form-request-health-system.component';
import { ResourceSearchDatatableModule } from './resource-search-datatable/resource-search-datatable.module';

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
    NgChartsModule,
    HighlightModule,
    PipesModule,
    DirectivesModule,
    FhirCardModule,
    FhirDatatableModule,
    ResourceSearchDatatableModule,

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
    MedicalRecordWizardAddEncounterComponent,
    MedicalRecordWizardAddLabResultsComponent,

  ],
  declarations: [
    ComponentsSidebarComponent,
    UtilitiesSidebarComponent,
    ToastComponent,
    ReportHeaderComponent,
    ReportMedicalHistoryConditionComponent,
    ReportLabsObservationComponent,
    ReportMedicalHistoryTimelinePanelComponent,

    ReportMedicalHistoryExplanationOfBenefitComponent,
    MedicalSourcesFilterComponent,
    MedicalSourcesConnectedComponent,
    MedicalSourcesCategoryLookupPipe,
    MedicalSourcesCardComponent,
    FormRequestHealthSystemComponent,
  ],
    exports: [
        ComponentsSidebarComponent,
        MedicalSourcesFilterComponent,
        NlmTypeaheadComponent,
        ReportHeaderComponent,
        ReportLabsObservationComponent,
        ReportMedicalHistoryConditionComponent,
        ReportMedicalHistoryExplanationOfBenefitComponent,
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
      MedicalRecordWizardAddAttachmentComponent,
      MedicalRecordWizardAddEncounterComponent,
      MedicalRecordWizardAddOrganizationComponent,
      MedicalRecordWizardAddPractitionerComponent,
      MedicalRecordWizardComponent,
      MedicalRecordWizardAddLabResultsComponent,
      MedicalSourcesCategoryLookupPipe,
      NlmTypeaheadComponent,
    ]
})

export class SharedModule { }
