import {Component, Input, OnInit} from '@angular/core';
import {ResourceFhir} from '../../models/fasten/resource_fhir';
import {EncounterModel} from '../../../lib/models/resources/encounter-model';
import {RecResourceRelatedDisplayModel} from '../../../lib/utils/resource_related_display_model';
import {DiagnosticReportModel} from '../../../lib/models/resources/diagnostic-report-model';
import {FastenDisplayModel} from '../../../lib/models/fasten/fasten-display-model';
import {MedicalRecordWizardComponent} from '../medical-record-wizard/medical-record-wizard.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-report-medical-history-timeline-panel',
  templateUrl: './report-medical-history-timeline-panel.component.html',
  styleUrls: ['./report-medical-history-timeline-panel.component.scss']
})
export class ReportMedicalHistoryTimelinePanelComponent implements OnInit {
  @Input() resourceFhir: ResourceFhir
  displayModel: EncounterModel

  constructor(private modalService: NgbModal) { }

  ngOnInit(): void {
    if (!this.resourceFhir) {
      return;
    }

    let parsed = RecResourceRelatedDisplayModel(this.resourceFhir)
    this.displayModel = parsed.displayModel as EncounterModel
  }

  diagnosticReportLink(diagnosticReportRaw: FastenDisplayModel): string {
    let diagnosticReport = diagnosticReportRaw as DiagnosticReportModel
    return diagnosticReport?.is_category_lab_report ?
      '/labs/report/'+ diagnosticReport?.source_id + '/' + diagnosticReport?.source_resource_type + '/' + diagnosticReport?.source_resource_id :
      '/explore/'+ diagnosticReport?.source_id + '/resource/' + diagnosticReport?.source_resource_id + '/'
  }


  openMedicalRecordWizard(): void {


    const modalRef = this.modalService.open(MedicalRecordWizardComponent, {
    // const modalRef = this.modalService.open(ReportMedicalHistoryEditorComponent, {
      size: 'xl',
    });
    modalRef.componentInstance.existingEncounter = this.displayModel;
  }

}
