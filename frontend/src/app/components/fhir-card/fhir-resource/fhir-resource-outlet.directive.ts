import {Directive, ViewContainerRef} from '@angular/core';

@Directive({
  selector: '[fhirResourceOutlet]'
})
export class FhirResourceOutletDirective {

  constructor(public viewContainerRef: ViewContainerRef) { }

}
