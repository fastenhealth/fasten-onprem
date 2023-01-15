import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FhirResourceComponent } from './fhir-resource.component';

describe('FhirResourceComponent', () => {
  let component: FhirResourceComponent;
  let fixture: ComponentFixture<FhirResourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FhirResourceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FhirResourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
