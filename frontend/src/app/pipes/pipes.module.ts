import { NgModule } from '@angular/core';


// Pipes
import {FhirPathPipe} from './fhir-path.pipe';
import {FilterPipe} from './filter.pipe';

@NgModule({
  declarations: [

    FhirPathPipe,
    FilterPipe,
  ],
  imports: [

  ],
  exports: [
    FhirPathPipe,
    FilterPipe
  ]
})
export class PipesModule {}
