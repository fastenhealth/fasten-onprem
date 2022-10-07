import {ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges, Type, ViewChild} from '@angular/core';
import {FastenDbService} from '../../services/fasten-db.service';
import {Source} from '../../../lib/models/database/source';
import {Observable, of} from 'rxjs';
import {ResourceFhir} from '../../../lib/models/database/resource_fhir';
import {ListAdverseEventComponent} from '../list-generic-resource/list-adverse-event.component';
import {ListCommunicationComponent} from '../list-generic-resource/list-communication.component';
import {ListConditionComponent} from '../list-generic-resource/list-condition.component';
import {ListCoverageComponent} from '../list-generic-resource/list-coverage.component';
import {ListDeviceRequestComponent} from '../list-generic-resource/list-device-request.component';
import {ListDocumentReferenceComponent} from '../list-generic-resource/list-document-reference.component';
import {ListEncounterComponent} from '../list-generic-resource/list-encounter.component';
import {ListImmunizationComponent} from '../list-generic-resource/list-immunization.component';
import {ListMedicationComponent} from '../list-generic-resource/list-medication.component';
import {ListMedicationAdministrationComponent} from '../list-generic-resource/list-medication-administration.component';
import {ListMedicationDispenseComponent} from '../list-generic-resource/list-medication-dispense.component';
import {ListMedicationRequestComponent} from '../list-generic-resource/list-medication-request.component';
import {ListNutritionOrderComponent} from '../list-generic-resource/list-nutrition-order.component';
import {ListObservationComponent} from '../list-generic-resource/list-observation.component';
import {ListProcedureComponent} from '../list-generic-resource/list-procedure.component';
import {ListServiceRequestComponent} from '../list-generic-resource/list-service-request.component';
import {map} from 'rxjs/operators';
import {ResponseWrapper} from '../../models/response-wrapper';
import {ListGenericResourceComponent, ResourceListComponentInterface} from '../list-generic-resource/list-generic-resource.component';
import {ListCarePlanComponent} from '../list-generic-resource/list-care-plan.component';
import {ListAllergyIntoleranceComponent} from '../list-generic-resource/list-allergy-intolerance.component';
import {ResourceListOutletDirective} from './resource-list-outlet.directive';
import {ListAppointmentComponent} from '../list-generic-resource/list-appointment.component';
import {ListDeviceComponent} from '../list-generic-resource/list-device.component';
import {ListDiagnosticReportComponent} from '../list-generic-resource/list-diagnostic-report.component';
import {ListGoalComponent} from '../list-generic-resource/list-goal.component';
import {ListFallbackResourceComponent} from '../list-fallback-resource/list-fallback-resource.component';

@Component({
  selector: 'source-resource-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './resource-list.component.html',
  styleUrls: ['./resource-list.component.scss']
})
export class ResourceListComponent implements OnInit, OnChanges {

  @Input() source: Source;
  @Input() resourceListType: string;
  resourceListCache: { [name:string]: ResourceFhir[] } = {}



  //location to dynamically load the resource list
  @ViewChild(ResourceListOutletDirective, {static: true}) resourceListOutlet!: ResourceListOutletDirective;


  constructor(private fastenDb: FastenDbService) { }

  ngOnInit(): void {
    this.loadComponent()
  }
  ngOnChanges(changes: SimpleChanges) {
    this.loadComponent()
  }

  loadComponent() {
    //clear the current outlet
    const viewContainerRef = this.resourceListOutlet.viewContainerRef;
    viewContainerRef.clear();

    this.getResources().then((resourceList) => {
      let componentType = this.typeLookup(this.resourceListType)
      if(componentType != null){
        console.log("Attempting to create component", this.resourceListType, componentType)
        const componentRef = viewContainerRef.createComponent<ResourceListComponentInterface>(componentType);
        componentRef.instance.resourceList = resourceList;
        componentRef.instance.markForCheck()

      }
    })
  }

  getResources(): Promise<ResourceFhir[]>{

    if(this.resourceListType && !this.resourceListCache[this.resourceListType]){
      // this resource type list has not been downloaded yet, do so now
      return this.fastenDb.GetResourcesForSource(this.source._id, this.resourceListType)
        .then((paginatedResponse) => {
          let resourceList = paginatedResponse.rows as ResourceFhir[]
          //cache this response so we can skip the request next time
          this.resourceListCache[this.resourceListType] = resourceList
          return resourceList
        })
    } else {
      return Promise.resolve(this.resourceListCache[this.resourceListType] || [])
    }
  }

  typeLookup(resourceType: string): Type<any> {
    if(!resourceType){
      //dont try to render anything if the resourceType isnt set.
      return null
    }
    switch(resourceType) {
      case "Appointment": {
        return ListAppointmentComponent;
      }
      case "AllergyIntolerance": {
        return ListAllergyIntoleranceComponent;
      }
      case "AdverseEvent": {
        return ListAdverseEventComponent;
      }
      case "CarePlan": {
        return ListCarePlanComponent;
      }
      case "Communication": {
        return ListCommunicationComponent;
      }
      case "Condition": {
        return ListConditionComponent;
      }
      case "Coverage": {
        return ListCoverageComponent;
      }
      case "Device": {
        return ListDeviceComponent;
      }
      case "DeviceRequest": {
        return ListDeviceRequestComponent;
      }
      case "DiagnosticReport": {
        return ListDiagnosticReportComponent;
      }
      case "DocumentReference": {
        return ListDocumentReferenceComponent;
      }
      case "Encounter": {
        return ListEncounterComponent;
      }
      case "Goal": {
        return ListGoalComponent;
      }
      case "Immunization": {
        return ListImmunizationComponent;
      }
      case "Medication": {
        return ListMedicationComponent;
      }
      case "MedicationAdministration": {
        return ListMedicationAdministrationComponent;
      }
      case "MedicationDispense": {
        return ListMedicationDispenseComponent;
      }
      case "MedicationRequest": {
        return ListMedicationRequestComponent;
      }
      case "NutritionOrder": {
        return ListNutritionOrderComponent;
      }
      case "Observation": {
        return ListObservationComponent;
      }
      case "Procedure": {
        return ListProcedureComponent;
      }
      case "ServiceRequest": {
        return ListServiceRequestComponent;
      }
      default: {
        console.warn("Unknown component type, using fallback", resourceType)
        return ListFallbackResourceComponent;

      }
    }
  }
}
