import {FastenDisplayModel} from '../../../../lib/models/fasten/fasten-display-model';

//all Fhir Resource  components must implement this Interface
export interface FhirResourceComponentInterface {
  displayModel: FastenDisplayModel;
  showDetails: boolean;
  markForCheck()
}
