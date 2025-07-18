import {
  Component,
  Input,
  OnInit,
  Type,
  ViewChild,
} from '@angular/core';
import { DatatableFallbackComponent } from './search-datatable-generic-resource/column-definitions';
import { DatatableServiceRequestComponent } from './search-datatable-generic-resource/column-definitions';
import { DatatableProcedureComponent } from './search-datatable-generic-resource/column-definitions';
import { DatatablePractitionerComponent } from './search-datatable-generic-resource/column-definitions';
import { DatatablePatientComponent } from './search-datatable-generic-resource/column-definitions';
import { DatatableOrganizationComponent } from './search-datatable-generic-resource/column-definitions';
import { DatatableObservationComponent } from './search-datatable-generic-resource/column-definitions';
import { DatatableNutritionOrderComponent } from './search-datatable-generic-resource/column-definitions';
import { DatatableMedicationRequestComponent } from './search-datatable-generic-resource/column-definitions';
import { DatatableMedicationDispenseComponent } from './search-datatable-generic-resource/column-definitions';
import { DatatableMedicationAdministrationComponent } from './search-datatable-generic-resource/column-definitions';
import { DatatableMedicationComponent } from './search-datatable-generic-resource/column-definitions';
import { DatatableLocationComponent } from './search-datatable-generic-resource/column-definitions';
import { DatatableImmunizationComponent } from './search-datatable-generic-resource/column-definitions';
import { DatatableGoalComponent } from './search-datatable-generic-resource/column-definitions';
import { DatatableEncounterComponent } from './search-datatable-generic-resource/column-definitions';
import { DatatableDocumentReferenceComponent } from './search-datatable-generic-resource/column-definitions';
import { DatatableDiagnosticReportComponent } from './search-datatable-generic-resource/column-definitions';
import { DatatableDeviceComponent } from './search-datatable-generic-resource/column-definitions';
import { DatatableDeviceRequestComponent } from './search-datatable-generic-resource/column-definitions';
import { DatatableCoverageComponent } from './search-datatable-generic-resource/column-definitions';
import { DatatableConditionComponent } from './search-datatable-generic-resource/column-definitions';
import { DatatableCommunicationComponent } from './search-datatable-generic-resource/column-definitions';
import { DatatableCareTeamComponent } from './search-datatable-generic-resource/column-definitions';
import { DatatableCarePlanComponent } from './search-datatable-generic-resource/column-definitions';
import { DatatableBinaryComponent } from './search-datatable-generic-resource/column-definitions';
import { DatatableAdverseEventComponent } from './search-datatable-generic-resource/column-definitions';
import { DatatableAllergyIntoleranceComponent } from './search-datatable-generic-resource/column-definitions';
import { DatatableAppointmentComponent } from './search-datatable-generic-resource/column-definitions';
import { Source } from 'src/app/models/fasten/source';
import { Router } from '@angular/router';
import { ResourceListComponentInterface } from '../fhir-datatable/datatable-generic-resource/datatable-generic-resource.component';
import { ResourceSearchDatatableOutletDirective } from './resource-search-datable-outlet.directive';
import { TypesenseDocument } from 'src/app/models/typesense/typesense-result-model';

@Component({
  selector: 'resource-search-datatable',
  templateUrl: './resource-search-datatable.component.html',
  styleUrls: ['./resource-search-datatable.component.scss'],
})
export class ResourceSearchDatatableComponent implements OnInit {
  @Input() source: Source;
  @Input() resourceListType; 
  @Input() selectedTotalElements: number;
  @Input() disabledResourceIds: string[] = [];

  //location to dynamically load the resource list
  @ViewChild(ResourceSearchDatatableOutletDirective, { static: true })
  resourceListOutlet!: ResourceSearchDatatableOutletDirective;

  knownResourceType: boolean = true;

  constructor(public router: Router) {}

  ngOnInit(): void {
    this.loadComponent();
  }
  ngOnChanges() {
    this.loadComponent();
  }

  loadComponent() {
    if (!this.resourceListOutlet) {
       return;
    }
    //clear the current outlet
    const viewContainerRef = this.resourceListOutlet.viewContainerRef;
    viewContainerRef.clear();

    let componentType = this.typeLookup(this.resourceListType);
    if (componentType != null) {
      const componentRef =
        viewContainerRef.createComponent<ResourceListComponentInterface>(
          componentType
        );
      componentRef.instance.totalElements = this.selectedTotalElements;
      componentRef.instance.resourceListType = this.resourceListType;

      componentRef.instance.selectionChanged.subscribe(
        (selected: TypesenseDocument) => {
          if (selected?.id) {
            this.router.navigate([`/resource/view/${selected.id}`]);
          } else {
            console.warn('Selected ID is undefined!', selected);
          }
        }
      );
      this.knownResourceType = componentType != DatatableFallbackComponent || this.resourceListType == 'All';
    }
  }

  typeLookup(resourceType: string): Type<ResourceListComponentInterface> {
    if (!resourceType) {
      //dont try to render anything if the resourceType isnt set.
      return null;
    }
    switch (resourceType) {
      case 'Appointment': {
        return DatatableAppointmentComponent;
      }
      case 'AllergyIntolerance': {
        return DatatableAllergyIntoleranceComponent;
      }
      case 'AdverseEvent': {
        return DatatableAdverseEventComponent;
      }
      case 'Binary': {
        return DatatableBinaryComponent;
      }
      case 'CarePlan': {
        return DatatableCarePlanComponent;
      }
      case 'CareTeam': {
        return DatatableCareTeamComponent;
      }
      case 'Communication': {
        return DatatableCommunicationComponent;
      }
      case 'Condition': {
        return DatatableConditionComponent;
      }
      case 'Coverage': {
        return DatatableCoverageComponent;
      }
      case 'Device': {
        return DatatableDeviceComponent;
      }
      case 'DeviceRequest': {
        return DatatableDeviceRequestComponent;
      }
      case 'DiagnosticReport': {
        return DatatableDiagnosticReportComponent;
      }
      case 'DocumentReference': {
        return DatatableDocumentReferenceComponent;
      }
      case 'Encounter': {
        return DatatableEncounterComponent;
      }
      case 'Goal': {
        return DatatableGoalComponent;
      }
      case 'Immunization': {
        return DatatableImmunizationComponent;
      }
      case 'Location': {
        return DatatableLocationComponent;
      }
      case 'Medication': {
        return DatatableMedicationComponent;
      }
      case 'MedicationAdministration': {
        return DatatableMedicationAdministrationComponent;
      }
      case 'MedicationDispense': {
        return DatatableMedicationDispenseComponent;
      }
      case 'MedicationRequest': {
        return DatatableMedicationRequestComponent;
      }
      case 'NutritionOrder': {
        return DatatableNutritionOrderComponent;
      }
      case 'Observation': {
        return DatatableObservationComponent;
      }
      case 'Organization': {
        return DatatableOrganizationComponent;
      }
      case 'Patient': {
        return DatatablePatientComponent;
      }
      case 'Practitioner': {
        return DatatablePractitionerComponent;
      }
      case 'Procedure': {
        return DatatableProcedureComponent;
      }
      case 'ServiceRequest': {
        return DatatableServiceRequestComponent;
      }
      case 'All': {
        // Use fallback component for 'All' type
        return DatatableFallbackComponent;
      }
      default: {
        console.warn('Unknown component type, using fallback', resourceType);
        return DatatableFallbackComponent;
      }
    }
  }
}
