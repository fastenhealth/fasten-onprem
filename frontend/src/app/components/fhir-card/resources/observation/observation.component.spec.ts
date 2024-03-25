import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObservationComponent } from './observation.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ObservationModel } from 'src/lib/models/resources/observation-model';
import { observationR4Factory } from 'src/lib/fixtures/factories/r4/resources/observation-r4-factory';
import { fhirVersions } from 'src/lib/models/constants';
import { By } from '@angular/platform-browser';

describe('ObservationComponent', () => {
  let component: ObservationComponent;
  let fixture: ComponentFixture<ObservationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ObservationComponent, RouterTestingModule ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ObservationComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should not display a visualization if table is the only visualization type', () => {
    component.displayModel = new ObservationModel(observationR4Factory.valueCodeableConcept().build(), fhirVersions.R4);
    fixture.detectChanges();

    expect(component.displayVisualization).toBeFalse();
    expect(fixture.debugElement.query(By.css('observation-visualization'))).toBeFalsy();
  });
});
