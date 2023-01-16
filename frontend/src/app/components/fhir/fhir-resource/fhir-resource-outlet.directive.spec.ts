import { FhirResourceOutletDirective } from './fhir-resource-outlet.directive';

import {
  ComponentFactory, ComponentRef,
  EmbeddedViewRef, EnvironmentInjector,
  Injector,
  NgModuleRef,
  TemplateRef,
  Type,
  ViewContainerRef
} from '@angular/core';

class TestViewContainerRef extends ViewContainerRef {
  get element(): import("@angular/core").ElementRef<any> {
    throw new Error("Method not implemented.");
  }
  get injector(): import("@angular/core").Injector {
    throw new Error("Method not implemented.");
  }
  get parentInjector(): import("@angular/core").Injector {
    throw new Error("Method not implemented.");
  }
  clear(): void {
    throw new Error("Method not implemented.");
  }
  get(index: number): import("@angular/core").ViewRef {
    throw new Error("Method not implemented.");
  }
  get length(): number {
    throw new Error("Method not implemented.");
  }
  // createEmbeddedView<C>(templateRef: import("@angular/core").TemplateRef<C>, context?: C, index?: number): import("@angular/core").EmbeddedViewRef<C> {
  //   throw new Error("Method not implemented.");
  // }
  // createComponent<C>(componentFactory: import("@angular/core").ComponentFactory<C>, index?: number, injector?: import("@angular/core").Injector, projectableNodes?: any[][], ngModule?: import("@angular/core").NgModuleRef<any>): import("@angular/core").ComponentRef<C> {
  //   throw new Error("Method not implemented.");
  // }
  insert(viewRef: import("@angular/core").ViewRef, index?: number): import("@angular/core").ViewRef {
    throw new Error("Method not implemented.");
  }
  move(viewRef: import("@angular/core").ViewRef, currentIndex: number): import("@angular/core").ViewRef {
    throw new Error("Method not implemented.");
  }
  indexOf(viewRef: import("@angular/core").ViewRef): number {
    throw new Error("Method not implemented.");
  }
  remove(index?: number): void {
    throw new Error("Method not implemented.");
  }
  detach(index?: number): import("@angular/core").ViewRef {
    throw new Error("Method not implemented.");
  }

  createComponent<C>(componentType: Type<C>, options?: { index?: number; injector?: Injector; ngModuleRef?: NgModuleRef<unknown>; environmentInjector?: EnvironmentInjector | NgModuleRef<unknown>; projectableNodes?: Node[][] }): ComponentRef<C>;
  createComponent<C>(componentFactory: ComponentFactory<C>, index?: number, injector?: Injector, projectableNodes?: any[][], environmentInjector?: EnvironmentInjector | NgModuleRef<any>): ComponentRef<C>;
  createComponent<C>(componentType, options?: { index?: number; injector?: Injector; ngModuleRef?: NgModuleRef<unknown>; environmentInjector?: EnvironmentInjector | NgModuleRef<unknown>; projectableNodes?: Node[][] } | number, injector?: Injector, projectableNodes?: any[][], environmentInjector?: EnvironmentInjector | NgModuleRef<any>): ComponentRef<C> {
    throw new Error("Method not implemented.");
  }

  createEmbeddedView<C>(templateRef: TemplateRef<C>, context?: C, options?: { index?: number; injector?: Injector }): EmbeddedViewRef<C>;
  createEmbeddedView<C>(templateRef: TemplateRef<C>, context?: C, index?: number): EmbeddedViewRef<C>;
  createEmbeddedView<C>(templateRef, context?, options?: { index?: number; injector?: Injector } | number): EmbeddedViewRef<C> {
    throw new Error("Method not implemented.");
  }

}


describe('FhirResourceOutletDirective', () => {


  it('should create an instance', () => {
    const directive = new FhirResourceOutletDirective(new TestViewContainerRef());
    expect(directive).toBeTruthy();
  });
});
