import {Directive, ViewContainerRef} from '@angular/core';

@Directive({
  selector: '[fhirCardOutlet]'
})
export class FhirCardOutletDirective {

  constructor(public viewContainerRef: ViewContainerRef) { }

}
