import {ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges, Type, ViewChild} from '@angular/core';
import {FastenApiService} from '../../../services/fasten-api.service';
import {Source} from '../../../models/fasten/source';
import {DatatableAdverseEventComponent} from '../datatable-generic-resource/datatable-adverse-event.component';
import {DatatableAllergyIntoleranceComponent} from '../datatable-generic-resource/datatable-allergy-intolerance.component';
import {DatatableAppointmentComponent} from '../datatable-generic-resource/datatable-appointment.component';
import {DatatableBinaryComponent} from '../datatable-generic-resource/datatable-binary.component';
import {DatatableCarePlanComponent} from '../datatable-generic-resource/datatable-care-plan.component';
import {DatatableCareTeamComponent} from '../datatable-generic-resource/datatable-care-team.component';
import {DatatableCommunicationComponent} from '../datatable-generic-resource/datatable-communication.component';
import {DatatableConditionComponent} from '../datatable-generic-resource/datatable-condition.component';
import {DatatableCoverageComponent} from '../datatable-generic-resource/datatable-coverage.component';
import {DatatableDeviceComponent} from '../datatable-generic-resource/datatable-device.component';
import {DatatableDeviceRequestComponent} from '../datatable-generic-resource/datatable-device-request.component';
import {DatatableDiagnosticReportComponent} from '../datatable-generic-resource/datatable-diagnostic-report.component';
import {DatatableDocumentReferenceComponent} from '../datatable-generic-resource/datatable-document-reference.component';
import {DatatableEncounterComponent} from '../datatable-generic-resource/datatable-encounter.component';
import {DatatableFallbackComponent} from '../datatable-generic-resource/datatable-fallback.component';
import {DatatableGenericResourceComponent, ResourceListComponentInterface} from '../datatable-generic-resource/datatable-generic-resource.component';
import {DatatableGoalComponent} from '../datatable-generic-resource/datatable-goal.component';
import {DatatableImmunizationComponent} from '../datatable-generic-resource/datatable-immunization.component';
import {DatatableLocationComponent} from '../datatable-generic-resource/datatable-location.component';
import {DatatableMedicationAdministrationComponent} from '../datatable-generic-resource/datatable-medication-administration.component';
import {DatatableMedicationComponent} from '../datatable-generic-resource/datatable-medication.component';
import {DatatableMedicationDispenseComponent} from '../datatable-generic-resource/datatable-medication-dispense.component';
import {DatatableMedicationRequestComponent} from '../datatable-generic-resource/datatable-medication-request.component';
import {DatatableNutritionOrderComponent} from '../datatable-generic-resource/datatable-nutrition-order.component';
import {DatatableObservationComponent} from '../datatable-generic-resource/datatable-observation.component';
import {DatatableOrganizationComponent} from '../datatable-generic-resource/datatable-organization.component';
import {DatatablePatientComponent} from '../datatable-generic-resource/datatable-patient.component';
import {DatatablePractitionerComponent} from '../datatable-generic-resource/datatable-practitioner.component';
import {DatatableProcedureComponent} from '../datatable-generic-resource/datatable-procedure.component';
import {DatatableServiceRequestComponent} from '../datatable-generic-resource/datatable-service-request.component';
import {FhirDatatableOutletDirective} from './fhir-datatable-outlet.directive';
import {Router} from '@angular/router';
import {FastenDisplayModel} from '../../../../lib/models/fasten/fasten-display-model';

@Component({
  selector: 'fhir-datatable',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './fhir-datatable.component.html',
  styleUrls: ['./fhir-datatable.component.scss']
})
export class FhirDatatableComponent implements OnInit, OnChanges {

  @Input() source: Source;
  @Input() resourceListType: string;
  @Input() selectedTotalElements: number;
  @Input() disabledResourceIds: string[] = [];
  @Input() isDelegatedResource: boolean = false;
  @Input() ownerUserId: string = '';

  //location to dynamically load the resource list
  @ViewChild(FhirDatatableOutletDirective, {static: true}) resourceListOutlet!: FhirDatatableOutletDirective;

  knownResourceType: boolean = true;

  constructor(public router: Router, private fastenApi: FastenApiService) { }

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
      const componentRef = viewContainerRef.createComponent<ResourceListComponentInterface>(componentType);
      componentRef.instance.totalElements = this.selectedTotalElements;
      componentRef.instance.resourceListType = this.resourceListType;
      componentRef.instance.sourceId = this.source.id;
      componentRef.instance.isDelegatedResource = this.isDelegatedResource;
      componentRef.instance.markForCheck()
      if(this.disabledResourceIds){
        componentRef.instance.disabledResourceIds = this.disabledResourceIds
      }

      componentRef.instance.selectionChanged.subscribe((selected: FastenDisplayModel) => {
        this.router.navigate(['/explore', selected?.source_id, 'resource', selected?.source_resource_id], 
        { queryParams: { isDelegatedResource: this.isDelegatedResource, ownerUserId: this.ownerUserId} }
        );
      })
      this.knownResourceType = (componentType != DatatableFallbackComponent)
    }
  }

  typeLookup(resourceType: string): Type<ResourceListComponentInterface> {
    if(!resourceType){
      //dont try to render anything if the resourceType isnt set.
      return null
    }
    switch(resourceType) {
      case "Appointment": {
        return DatatableAppointmentComponent;
      }
      case "AllergyIntolerance": {
        return DatatableAllergyIntoleranceComponent;
      }
      case "AdverseEvent": {
        return DatatableAdverseEventComponent;
      }
      case "Binary": {
        return DatatableBinaryComponent;
      }
      case "CarePlan": {
        return DatatableCarePlanComponent;
      }
      case "CareTeam": {
        return DatatableCareTeamComponent;
      }
      case "Communication": {
        return DatatableCommunicationComponent;
      }
      case "Condition": {
        return DatatableConditionComponent;
      }
      case "Coverage": {
        return DatatableCoverageComponent;
      }
      case "Device": {
        return DatatableDeviceComponent;
      }
      case "DeviceRequest": {
        return DatatableDeviceRequestComponent;
      }
      case "DiagnosticReport": {
        return DatatableDiagnosticReportComponent;
      }
      case "DocumentReference": {
        return DatatableDocumentReferenceComponent;
      }
      case "Encounter": {
        return DatatableEncounterComponent;
      }
      case "Goal": {
        return DatatableGoalComponent;
      }
      case "Immunization": {
        return DatatableImmunizationComponent;
      }
      case "Location": {
        return DatatableLocationComponent;
      }
      case "Medication": {
        return DatatableMedicationComponent;
      }
      case "MedicationAdministration": {
        return DatatableMedicationAdministrationComponent;
      }
      case "MedicationDispense": {
        return DatatableMedicationDispenseComponent;
      }
      case "MedicationRequest": {
        return DatatableMedicationRequestComponent;
      }
      case "NutritionOrder": {
        return DatatableNutritionOrderComponent;
      }
      case "Observation": {
        return DatatableObservationComponent;
      }
      case "Organization": {
        return DatatableOrganizationComponent;
      }
      case "Patient": {
        return DatatablePatientComponent;
      }
      case "Practitioner": {
        return DatatablePractitionerComponent;
      }
      case "Procedure": {
        return DatatableProcedureComponent;
      }
      case "ServiceRequest": {
        return DatatableServiceRequestComponent;
      }
      default: {
        console.warn("Unknown component type, using fallback", resourceType)
        return DatatableFallbackComponent;

      }
    }
  }
}
