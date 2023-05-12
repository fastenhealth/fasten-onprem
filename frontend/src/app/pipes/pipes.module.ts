import { NgModule } from '@angular/core';


// Pipes
import {FhirPathPipe} from './fhir-path.pipe';
import {FilterPipe} from './filter.pipe';
import { ShortDomainPipe } from './short-domain.pipe';

@NgModule({
  declarations: [

    FhirPathPipe,
    FilterPipe,
    ShortDomainPipe,
  ],
  imports: [

  ],
  exports: [
    FhirPathPipe,
    FilterPipe,
    ShortDomainPipe
  ]
})
export class PipesModule {}
