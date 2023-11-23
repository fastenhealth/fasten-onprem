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
import {ImmunizationComponent} from '../resources/immunization/immunization.component';
import {AllergyIntoleranceComponent} from '../resources/allergy-intolerance/allergy-intolerance.component';
import {MedicationComponent} from '../resources/medication/medication.component';
import {MedicationRequestComponent} from '../resources/medication-request/medication-request.component';
import {FastenDisplayModel} from '../../../../lib/models/fasten/fasten-display-model';
import {ProcedureComponent} from '../resources/procedure/procedure.component';
import {DiagnosticReportComponent} from '../resources/diagnostic-report/diagnostic-report.component';
import {PractitionerComponent} from '../resources/practitioner/practitioner.component';
import {DocumentReferenceComponent} from '../resources/document-reference/document-reference.component';
import {MediaComponent} from '../resources/media/media.component';
import {LocationComponent} from '../resources/location/location.component';
import {OrganizationComponent} from '../resources/organization/organization.component';
import {ObservationComponent} from '../resources/observation/observation.component';


@Component({
  selector: 'fhir-resource',
  changeDetection: ChangeDetectionStrategy.Default,
  templateUrl: './fhir-resource.component.html',
  styleUrls: ['./fhir-resource.component.scss']
})
export class FhirResourceComponent implements OnInit, OnChanges {

  @Input() displayModel: FastenDisplayModel
  @Input() showDetails: boolean = true

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

    let componentType = this.typeLookup(this.displayModel?.source_resource_type)
    if(componentType != null){
      console.log("Attempting to create fhir display component", this.displayModel, componentType)
      const componentRef = viewContainerRef.createComponent<FhirResourceComponentInterface>(componentType);
      componentRef.instance.displayModel = this.displayModel;
      componentRef.instance.showDetails = this.showDetails;
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
      case "AllergyIntolerance": {
        return AllergyIntoleranceComponent;
      }
      // case "AdverseEvent": {
      //   return ListAdverseEventComponent;
      // }
      case "Binary": {
        return BinaryComponent;
      }
      // case "CarePlan": {
      //   return ListCarePlanComponent;
      // }
      // case "CareTeam": {
      //   return CareTeamComponent;
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
      case "DiagnosticReport": {
        return DiagnosticReportComponent;
      }
      case "DocumentReference": {
        return DocumentReferenceComponent;
      }
      // case "Encounter": {
      //   return ListEncounterComponent;
      // }
      // case "Goal": {
      //   return ListGoalComponent;
      // }
      case "Immunization": {
        return ImmunizationComponent;
      }
      case "Location": {
        return LocationComponent;
      }
      case "Media": {
        return MediaComponent;
      }
      case "Medication": {
        return MedicationComponent;
      }
      // case "MedicationAdministration": {
      //   return ListMedicationAdministrationComponent;
      // }
      // case "MedicationDispense": {
      //   return ListMedicationDispenseComponent;
      // }
      case "MedicationRequest": {
        return MedicationRequestComponent;
      }
      // case "NutritionOrder": {
      //   return ListNutritionOrderComponent;
      // }
      case "Observation": {
        return ObservationComponent;
      }
      case "Organization": {
        return OrganizationComponent;
      }
      case "Procedure": {
        return ProcedureComponent;
      }
      case "Practitioner": {
        return PractitionerComponent;
      }
      // case "PractitionerRole": {
      //   return PractitionerRoleComponent;
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
