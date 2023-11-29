import { NgModule } from '@angular/core';


// Pipes
import {FhirPathPipe} from './fhir-path.pipe';
import {FilterPipe} from './filter.pipe';
import { ShortDomainPipe } from './short-domain.pipe';
import { DatasetLatestEntryPipe } from './dataset-latest-entry.pipe';
import { HumanNamePipe } from './human-name.pipe';

@NgModule({
  declarations: [

    FhirPathPipe,
    FilterPipe,
    ShortDomainPipe,
    DatasetLatestEntryPipe,
    HumanNamePipe,
  ],
  imports: [

  ],
  exports: [
    FhirPathPipe,
    FilterPipe,
    ShortDomainPipe,
    DatasetLatestEntryPipe,
    HumanNamePipe,
  ]
})
export class PipesModule {}
