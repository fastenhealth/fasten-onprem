import {Directive, ViewContainerRef} from '@angular/core';

@Directive({
  selector: '[fhirDatatableOutlet]'
})
export class FhirDatatableOutletDirective {

  constructor(public viewContainerRef: ViewContainerRef) { }

}
