import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FhirCardComponent } from './fhir-card.component';
import {FhirCardOutletDirective} from './fhir-card-outlet.directive';

describe('FhirResourceComponent', () => {
  let component: FhirCardComponent;
  let fixture: ComponentFixture<FhirCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FhirCardComponent, FhirCardOutletDirective ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(FhirCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
