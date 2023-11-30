import {Component, Input, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {NlmTypeaheadComponent} from '../nlm-typeahead/nlm-typeahead.component';
import {HighlightModule} from 'ngx-highlightjs';
import {NgbActiveModal, NgbDatepickerModule, NgbNavModule, NgbTooltipModule} from '@ng-bootstrap/ng-bootstrap';
import {FhirDatatableModule} from '../fhir-datatable/fhir-datatable.module';
import {ResourceType} from '../../../lib/models/constants';
import {ResourceFhir} from '../../models/fasten/resource_fhir';
import {FastenApiService} from '../../services/fasten-api.service';
import {ResponseWrapper} from '../../models/response-wrapper';
import {fhirModelFactory} from '../../../lib/models/factory';
import {RecResourceRelatedDisplayModel} from '../../../lib/utils/resource_related_display_model';
import {EncounterModel} from '../../../lib/models/resources/encounter-model';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NlmTypeaheadComponent,
    HighlightModule,
    NgbTooltipModule,
    NgbNavModule,
    FhirDatatableModule,
    NgbDatepickerModule
  ],
  selector: 'app-medical-record-wizard-add-encounter',
  templateUrl: './medical-record-wizard-add-encounter.component.html',
  styleUrls: ['./medical-record-wizard-add-encounter.component.scss']
})
export class MedicalRecordWizardAddEncounterComponent implements OnInit {

  @Input() debugMode: boolean = false;
  loading: boolean = false
  activeId: string = 'find'

  //create tab options
  newEncounterTypeaheadForm: FormGroup
  newEncounterForm: FormGroup //ResourceCreateEncounter

  //find tab options
  selectedEncounter: {source_id: string, source_resource_id: string,source_resource_type: ResourceType, resource: ResourceFhir} = null
  totalEncounters: number = 0
  constructor(
    public activeModal: NgbActiveModal,
    private fastenApi: FastenApiService,
  ) { }

  ngOnInit(): void {
    this.resetEncounterForm()

    //get a count of all the known organizations
    this.fastenApi.queryResources({
      "select": [],
      "from": "Encounter",
      "where": {},
      "aggregations": {
        "count_by": {"field": "*"}
      }
    }).subscribe((resp: ResponseWrapper) => {
      this.totalEncounters = resp.data?.[0].value
    })
  }

  changeTab(id: string) {
    if(this.activeId != id){
      this.activeId = id
      this.resetEncounterForm()
      this.selectedEncounter = null
    }
  }
  selectionChanged(event) {
    console.log("SELECTION CHANGED", event)
    this.selectedEncounter = event
  }
  get submitEnabled() {
    return (this.activeId == 'create' && this.newEncounterForm.valid) ||
      (this.activeId == 'find' && this.selectedEncounter != null)
  }

  submit() {
    if(this.activeId == 'create'){
      this.newEncounterTypeaheadForm.markAllAsTouched()
      if(this.newEncounterForm.valid){
        this.activeModal.close({
          action: this.activeId,
          // data: this.encounterFormToDisplayModel(this.newEncounterForm)
        });
      }
    } else if(this.activeId == 'find'){
      if(this.selectedEncounter == null){
        return
      }

      //get all the related resources for the selected encounter
      this.loading = true
      this.fastenApi.getResourceGraph(null, [{
        source_resource_type: this.selectedEncounter.source_resource_type,
        source_resource_id: this.selectedEncounter.source_resource_id,
        source_id: this.selectedEncounter.source_id,
      }]).subscribe((graphResponse) => {
        this.loading = false

        if(graphResponse.results["Encounter"]?.[0]){

          let parsed = RecResourceRelatedDisplayModel(graphResponse.results["Encounter"]?.[0])
          let encounterDisplayModelWithRelated = parsed.displayModel as EncounterModel

          console.log("Found encounter (and related resources)", encounterDisplayModelWithRelated)
          this.activeModal.close({
            action: this.activeId,
            data: encounterDisplayModelWithRelated
          });
        } else {
          console.warn("No encounter found in graph response, falling back to selected encounter", graphResponse)
          this.activeModal.close({
            action: this.activeId,
            data: fhirModelFactory(this.selectedEncounter.source_resource_type, this.selectedEncounter.resource)
          });
        }
      }, (err) => {
        this.loading = false
      })
    }
  }

  private resetEncounterForm(){

    this.newEncounterForm = new FormGroup({
      id: new FormControl(null),
      identifier: new FormControl([]),
      period_start: new FormControl(null, Validators.required),
      period_end: new FormControl(null),
      participant: new FormControl(null),
      location: new FormControl(null, Validators.pattern('[- +()0-9]+')),
    })

  }
}
