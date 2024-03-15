import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {BadgeComponent} from './common/badge/badge.component';
import {TableComponent} from './common/table/table.component';
import {BinaryTextComponent} from './datatypes/binary-text/binary-text.component';
import {CodableConceptComponent} from './datatypes/codable-concept/codable-concept.component';
import {CodingComponent} from './datatypes/coding/coding.component';
import {DicomComponent} from './datatypes/dicom/dicom.component';
import {HtmlComponent} from './datatypes/html/html.component';
import {ImgComponent} from './datatypes/img/img.component';
import {MarkdownComponent} from './datatypes/markdown/markdown.component';
import {PdfComponent} from './datatypes/pdf/pdf.component';
import {AllergyIntoleranceComponent} from './resources/allergy-intolerance/allergy-intolerance.component';
import {BinaryComponent} from './resources/binary/binary.component';
import {DiagnosticReportComponent} from './resources/diagnostic-report/diagnostic-report.component';
import {DocumentReferenceComponent} from './resources/document-reference/document-reference.component';
import {FallbackComponent} from './resources/fallback/fallback.component';
import {ImmunizationComponent} from './resources/immunization/immunization.component';
import {LocationComponent} from './resources/location/location.component';
import {MediaComponent} from './resources/media/media.component';
import {MedicationComponent} from './resources/medication/medication.component';
import {MedicationRequestComponent} from './resources/medication-request/medication-request.component';
import {ObservationComponent} from './resources/observation/observation.component';
import {OrganizationComponent} from './resources/organization/organization.component';
import {PractitionerComponent} from './resources/practitioner/practitioner.component';
import {ProcedureComponent} from './resources/procedure/procedure.component';
import {FhirCardComponent} from './fhir-card/fhir-card.component';
import {FhirCardOutletDirective} from './fhir-card/fhir-card-outlet.directive';
import { EncounterComponent } from './resources/encounter/encounter.component';
import { RtfComponent } from './datatypes/rtf/rtf.component';
import { ObservationBarChartComponent } from './common/observation-bar-chart/observation-bar-chart.component';



@NgModule({
  imports: [
    //common
    CommonModule,
    BadgeComponent,
    ObservationBarChartComponent,
    //datatypes
    TableComponent,
    BinaryTextComponent,
    CodableConceptComponent,
    CodingComponent,
    DicomComponent,
    HtmlComponent,
    ImgComponent,
    MarkdownComponent,
    PdfComponent,
    RtfComponent,
    //resources
    AllergyIntoleranceComponent,
    BinaryComponent,
    DiagnosticReportComponent,
    DocumentReferenceComponent,
    EncounterComponent,
    FallbackComponent,
    ImmunizationComponent,
    LocationComponent,
    MediaComponent,
    MedicationComponent,
    MedicationRequestComponent,
    ObservationComponent,
    OrganizationComponent,
    PractitionerComponent,
    ProcedureComponent,

  ],
  //TODO: every component in here should be migrated to a standalone component
  declarations: [
    FhirCardComponent,
    FhirCardOutletDirective,

  ],
  exports:[
    //common
    BadgeComponent,
    TableComponent,
    ObservationBarChartComponent,
    //datatypes
    BinaryTextComponent,
    CodableConceptComponent,
    CodingComponent,
    DicomComponent,
    HtmlComponent,
    ImgComponent,
    MarkdownComponent,
    PdfComponent,
    RtfComponent,
    //resources
    AllergyIntoleranceComponent,
    BinaryComponent,
    DiagnosticReportComponent,
    DocumentReferenceComponent,
    EncounterComponent,
    FallbackComponent,
    ImmunizationComponent,
    LocationComponent,
    MediaComponent,
    MedicationComponent,
    MedicationRequestComponent,
    ObservationComponent,
    OrganizationComponent,
    PractitionerComponent,
    ProcedureComponent,

    FhirCardComponent,
    FhirCardOutletDirective,
  ]
})
export class FhirCardModule { }
