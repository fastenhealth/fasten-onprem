import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[resourceSearchDatatableOutlet]',
})
export class ResourceSearchDatatableOutletDirective {
  constructor(public viewContainerRef: ViewContainerRef) {}
}
