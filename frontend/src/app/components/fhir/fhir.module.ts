import { NgModule } from '@angular/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { RouterModule } from '@angular/router';
import {BrowserModule} from '@angular/platform-browser';
import {NgbCollapseModule, NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { MomentModule } from 'ngx-moment';
import { ChartsModule } from 'ng2-charts';
import { BinaryComponent } from './resources/binary/binary.component';
import { PdfComponent } from './datatypes/pdf/pdf.component';
import { ImgComponent } from './datatypes/img/img.component';
import { BinaryTextComponent } from './datatypes/binary-text/binary-text.component';
import { MarkdownComponent } from './datatypes/markdown/markdown.component';
import { HtmlComponent } from './datatypes/html/html.component';
import { DicomComponent } from './datatypes/dicom/dicom.component';
import { CodingComponent } from './datatypes/coding/coding.component';

import { FhirResourceComponent } from './fhir-resource/fhir-resource.component';
import { FhirResourceOutletDirective } from './fhir-resource/fhir-resource-outlet.directive';
import { FallbackComponent } from './resources/fallback/fallback.component';
import { ImmunizationComponent } from './resources/immunization/immunization.component';
import { AllergyIntoleranceComponent } from './resources/allergy-intolerance/allergy-intolerance.component';
import { MedicationComponent } from './resources/medication/medication.component';
import { MedicationRequestComponent } from './resources/medication-request/medication-request.component';
import { ProcedureComponent } from './resources/procedure/procedure.component';
import { DiagnosticReportComponent } from './resources/diagnostic-report/diagnostic-report.component';
import { PractitionerComponent } from './resources/practitioner/practitioner.component';
import { DocumentReferenceComponent } from './resources/document-reference/document-reference.component';
import { MediaComponent } from './resources/media/media.component';

import { BadgeComponent } from './common/badge/badge.component';
import { TableComponent } from './common/table/table.component';
import {StatusModule} from '../status/status.module';
import {HighlightModule} from 'ngx-highlightjs';

@NgModule({
  imports: [
    RouterModule,
    BrowserModule,
    NgxDatatableModule,
    NgbModule,
    NgbCollapseModule,
    HighlightModule,
    MomentModule,
    ChartsModule,
    StatusModule,
  ],
  declarations: [
    BinaryComponent,
    PdfComponent,
    ImgComponent,
    BinaryTextComponent,
    MarkdownComponent,
    HtmlComponent,
    FhirResourceComponent,
    FhirResourceOutletDirective,
    FallbackComponent,
    ImmunizationComponent,
    BadgeComponent,
    TableComponent,
    CodingComponent,
    AllergyIntoleranceComponent,
    MedicationComponent,
    MedicationRequestComponent,
    ProcedureComponent,
    DiagnosticReportComponent,
    PractitionerComponent,
    DocumentReferenceComponent,
    DicomComponent,
    MediaComponent,
  ],
  exports: [
    BinaryComponent,
    FhirResourceComponent,
    FhirResourceOutletDirective,
    FallbackComponent,
    ImmunizationComponent,
    BadgeComponent,
    TableComponent,
    CodingComponent,
    AllergyIntoleranceComponent,
    MedicationComponent,
    MedicationRequestComponent,
    ProcedureComponent,
    DiagnosticReportComponent,
    PractitionerComponent,
    DocumentReferenceComponent,
  ]
})

export class FhirModule { }
