import {Component, Input, OnInit} from '@angular/core';
import {ResourceFhir} from '../../models/fasten/resource_fhir';
import {EncounterModel} from '../../../lib/models/resources/encounter-model';
import {RecResourceRelatedDisplayModel} from '../../../lib/utils/resource_related_display_model';

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

}
