import { EventEmitter } from '@angular/core';
import {FastenDisplayModel} from '../../../../lib/models/fasten/fasten-display-model';

//all Fhir Resource  components must implement this Interface
export interface FhirCardComponentInterface {
  displayModel: FastenDisplayModel;
  showDetails: boolean;
  isCollapsed: boolean;

  //these are used to populate the description of the resource. May not be available for all resources
  resourceCode?: string;
  resourceCodeSystem?: string;

  markForCheck()
}

// FHIR Resource components that support unlinking should implement this
export interface FhirCardUnlinkableComponentInterface extends FhirCardComponentInterface {
  isUnlinkable: boolean;
  unlinkRequested: EventEmitter<FastenDisplayModel>;
}