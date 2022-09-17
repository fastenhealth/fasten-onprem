import {Directive, ViewContainerRef} from '@angular/core';

@Directive({
  selector: '[resourceListOutlet]'
})
export class ResourceListOutletDirective {

  constructor(public viewContainerRef: ViewContainerRef) { }

}
