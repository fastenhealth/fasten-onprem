import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  Type,
  ViewChild
} from '@angular/core';
import {BinaryModel} from '../../../../lib/models/resources/binary-model';
import {FhirCardOutletDirective} from './fhir-card-outlet.directive';

import {ResourceType} from '../../../../lib/models/constants';
import {FallbackComponent} from '../resources/fallback/fallback.component';
import {BinaryComponent} from '../resources/binary/binary.component';
import {FhirCardComponentInterface, FhirCardEditableComponentInterface} from './fhir-card-component-interface';
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
import {EncounterComponent} from '../resources/encounter/encounter.component';
import {PatientComponent} from '../resources/patient/patient.component';


@Component({
  selector: 'fhir-card',
  changeDetection: ChangeDetectionStrategy.Default,
  templateUrl: './fhir-card.component.html',
  styleUrls: ['./fhir-card.component.scss']
})
export class FhirCardComponent implements OnInit, OnChanges {

  @Input() displayModel: FastenDisplayModel
  @Input() showDetails: boolean = true
  @Input() isCollapsed: boolean = false
  @Input() isEditable: boolean = false

  @Output() unlinkRequested = new EventEmitter<FastenDisplayModel>()
  @Output() editRequested = new EventEmitter<FastenDisplayModel>()

  //location to dynamically load the displayModel
  @ViewChild(FhirCardOutletDirective, {static: true}) fhirCardOutlet!: FhirCardOutletDirective;

  constructor() { }

  ngOnInit(): void {
    this.loadComponent()
  }
  ngOnChanges(changes: SimpleChanges) {
    this.loadComponent()
  }

  loadComponent() {
    //clear the current outlet
    const viewContainerRef = this.fhirCardOutlet.viewContainerRef;
    viewContainerRef.clear();

    let componentType = this.typeLookup(this.displayModel?.source_resource_type)
    if(componentType != null){
      const componentRef = viewContainerRef.createComponent<FhirCardComponentInterface>(componentType);
      componentRef.instance.displayModel = this.displayModel;
      componentRef.instance.showDetails = this.showDetails;
      componentRef.instance.isCollapsed = this.isCollapsed;
      componentRef.instance.markForCheck()

      if(this.isUnlinkableFhirCardComponent(componentRef.instance)) {
        componentRef.instance.isEditable = this.isEditable
        componentRef.instance.unlinkRequested.subscribe(model => {
          this.unlinkRequested.emit(model)
        })
        componentRef.instance.editRequested.subscribe(model => {
          this.editRequested.emit(model)
        })
      }
    }
  }

  typeLookup(resourceType: ResourceType): Type<FhirCardComponentInterface> {
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
      case "Encounter": {
        return EncounterComponent;
      }
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
      case "Patient": {
        return PatientComponent;
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

  isUnlinkableFhirCardComponent(component: any): component is FhirCardEditableComponentInterface {
    return (component as FhirCardEditableComponentInterface).isEditable !== undefined &&
      (component as FhirCardEditableComponentInterface).editRequested instanceof EventEmitter &&
      (component as FhirCardEditableComponentInterface).unlinkRequested instanceof EventEmitter;
  }

}
