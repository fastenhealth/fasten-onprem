import {Component, Input, OnInit} from '@angular/core';
import {ResourceFhir} from '../../models/fasten/resource_fhir';
import {EncounterModel} from '../../../lib/models/resources/encounter-model';
import {RecResourceRelatedDisplayModel} from '../../../lib/utils/resource_related_display_model';
import {LocationModel} from '../../../lib/models/resources/location-model';
import {PractitionerModel} from '../../../lib/models/resources/practitioner-model';
import {OrganizationModel} from '../../../lib/models/resources/organization-model';
import {fhirModelFactory} from '../../../lib/models/factory';
import {ResourceType} from '../../../lib/models/constants';
import {DiagnosticReportModel} from '../../../lib/models/resources/diagnostic-report-model';
import {FastenDisplayModel} from '../../../lib/models/fasten/fasten-display-model';

@Component({
  selector: 'app-report-medical-history-timeline-panel',
  templateUrl: './report-medical-history-timeline-panel.component.html',
  styleUrls: ['./report-medical-history-timeline-panel.component.scss']
})
export class ReportMedicalHistoryTimelinePanelComponent implements OnInit {
  @Input() resourceFhir: ResourceFhir
  displayModel: EncounterModel

  constructor() { }

  ngOnInit(): void {

    let parsed = RecResourceRelatedDisplayModel(this.resourceFhir)
    this.displayModel = parsed.displayModel as EncounterModel
  }

  diagnosticReportLink(diagnosticReportRaw: FastenDisplayModel): string {
    console.log('diagnosticReportRaw', diagnosticReportRaw)
    let diagnosticReport = diagnosticReportRaw as DiagnosticReportModel
    return diagnosticReport?.is_category_lab_report ?
      '/labs/report/'+ diagnosticReport?.source_id + '/' + diagnosticReport?.source_resource_type + '/' + diagnosticReport?.source_resource_id :
      '/explore/'+ diagnosticReport?.source_id + '/resource/' + diagnosticReport?.source_resource_id + '/'
  }

}
