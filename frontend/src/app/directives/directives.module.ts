import { NgModule } from '@angular/core';


// Directives
import {ExternalLinkDirective} from './external-link.directive';
import { ImageFallbackDirective } from './image-fallback.directive';

@NgModule({
  declarations: [
    ExternalLinkDirective,
    ImageFallbackDirective,
  ],
  imports: [

  ],
    exports: [
        ExternalLinkDirective,
        ImageFallbackDirective,
    ]
})
export class DirectivesModule {}
