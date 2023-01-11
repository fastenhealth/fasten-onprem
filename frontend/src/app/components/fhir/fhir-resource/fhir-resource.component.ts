import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  Type,
  ViewChild
} from '@angular/core';
import {BinaryModel} from '../../../../lib/models/resources/binary-model';
import {FhirResourceOutletDirective} from './fhir-resource-outlet.directive';

import {ResourceType} from '../../../../lib/models/constants';
import {FallbackComponent} from '../resources/fallback/fallback.component';
import {BinaryComponent} from '../resources/binary/binary.component';
import {FhirResourceComponentInterface} from './fhir-resource-component-interface';

@Component({
  selector: 'fhir-resource',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './fhir-resource.component.html',
  styleUrls: ['./fhir-resource.component.scss']
})
export class FhirResourceComponent implements OnInit, OnChanges {

  @Input() displayModel: BinaryModel

  //location to dynamically load the displayModel
  @ViewChild(FhirResourceOutletDirective, {static: true}) fhirResourceOutlet!: FhirResourceOutletDirective;

  constructor() { }

  ngOnInit(): void {
    this.loadComponent()
  }
  ngOnChanges(changes: SimpleChanges) {
    this.loadComponent()
  }

  loadComponent() {
    //clear the current outlet
    const viewContainerRef = this.fhirResourceOutlet.viewContainerRef;
    viewContainerRef.clear();

    let componentType = this.typeLookup(this.displayModel.source_resource_type)
    if(componentType != null){
      console.log("Attempting to create fhir display component", this.displayModel, componentType)
      const componentRef = viewContainerRef.createComponent<FhirResourceComponentInterface>(componentType);
      componentRef.instance.displayModel = this.displayModel;
      componentRef.instance.markForCheck()

    }
  }

  typeLookup(resourceType: ResourceType): Type<FhirResourceComponentInterface> {
    if(!resourceType){
      //dont try to render anything if the resourceType isnt set.
      return null
    }
    switch(resourceType) {
      // case "Appointment": {
      //   return ListAppointmentComponent;
      // }
      // case "AllergyIntolerance": {
      //   return ListAllergyIntoleranceComponent;
      // }
      // case "AdverseEvent": {
      //   return ListAdverseEventComponent;
      // }
      case "Binary": {
        return BinaryComponent;
      }
      // case "CarePlan": {
      //   return ListCarePlanComponent;
      // }
      // case "Communication": {
      //   return ListCommunicationComponent;
      // }
      // case "Condition": {
      //   return ListConditionComponent;
      // }
      // case "Coverage": {
      //   return ListCoverageComponent;
      // }
      // case "Device": {
      //   return ListDeviceComponent;
      // }
      // case "DeviceRequest": {
      //   return ListDeviceRequestComponent;
      // }
      // case "DiagnosticReport": {
      //   return ListDiagnosticReportComponent;
      // }
      // case "DocumentReference": {
      //   return ListDocumentReferenceComponent;
      // }
      // case "Encounter": {
      //   return ListEncounterComponent;
      // }
      // case "Goal": {
      //   return ListGoalComponent;
      // }
      // case "Immunization": {
      //   return ListImmunizationComponent;
      // }
      // case "Medication": {
      //   return ListMedicationComponent;
      // }
      // case "MedicationAdministration": {
      //   return ListMedicationAdministrationComponent;
      // }
      // case "MedicationDispense": {
      //   return ListMedicationDispenseComponent;
      // }
      // case "MedicationRequest": {
      //   return ListMedicationRequestComponent;
      // }
      // case "NutritionOrder": {
      //   return ListNutritionOrderComponent;
      // }
      // case "Observation": {
      //   return ListObservationComponent;
      // }
      // case "Procedure": {
      //   return ListProcedureComponent;
      // }
      // case "ServiceRequest": {
      //   return ListServiceRequestComponent;
      // }
      default: {
        console.warn("Unknown component type, using fallback", resourceType)
        return FallbackComponent;

      }
    }
  }



}
