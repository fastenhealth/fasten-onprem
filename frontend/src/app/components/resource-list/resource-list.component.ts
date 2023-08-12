import {ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges, Type, ViewChild} from '@angular/core';
import {FastenApiService} from '../../services/fasten-api.service';
import {Source} from '../../models/fasten/source';
import {Observable, of} from 'rxjs';
import {ResourceFhir} from '../../models/fasten/resource_fhir';
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
import {ListFallbackComponent} from '../list-generic-resource/list-fallback.component';

@Component({
  selector: 'source-resource-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './resource-list.component.html',
  styleUrls: ['./resource-list.component.scss']
})
export class ResourceListComponent implements OnInit, OnChanges {

  @Input() source: Source;
  @Input() resourceListType: string;
  @Input() selectedTotalElements: number;

  //location to dynamically load the resource list
  @ViewChild(ResourceListOutletDirective, {static: true}) resourceListOutlet!: ResourceListOutletDirective;


  constructor(private fastenApi: FastenApiService) { }

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

    let componentType = this.typeLookup(this.resourceListType)
    if(componentType != null){
      console.log("Attempting to create component", this.resourceListType, componentType)
      const componentRef = viewContainerRef.createComponent<ResourceListComponentInterface>(componentType);
      componentRef.instance.totalElements = this.selectedTotalElements;
      componentRef.instance.resourceListType = this.resourceListType;
      componentRef.instance.sourceId = this.source.id;
      componentRef.instance.markForCheck()
    }
  }

  typeLookup(resourceType: string): Type<ResourceListComponentInterface> {
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
        return ListFallbackComponent;

      }
    }
  }
}
