import { NgModule } from '@angular/core';


// Directives
import {ExternalLinkDirective} from './external-link.directive';

@NgModule({
  declarations: [
    ExternalLinkDirective,
  ],
  imports: [

  ],
  exports: [
    ExternalLinkDirective,
  ]
})
export class DirectivesModule {}
