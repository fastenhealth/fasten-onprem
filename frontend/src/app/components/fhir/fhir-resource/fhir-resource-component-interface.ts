import {FastenDisplayModel} from '../../../../lib/models/fasten/fasten-display-model';

//all Fhir Resource  components must implement this Interface
export interface FhirResourceComponentInterface {
  displayModel: FastenDisplayModel;
  showDetails: boolean;

  //these are used to populate the description of the resource. May not be available for all resources
  resourceCode?: string;
  resourceCodeSystem?: string;

  markForCheck()
}
