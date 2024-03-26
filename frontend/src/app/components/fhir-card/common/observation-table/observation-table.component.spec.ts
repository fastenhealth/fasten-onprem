import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ObservationTableComponent } from './observation-table.component';
import { ObservationModel } from 'src/lib/models/resources/observation-model';
import { observationR4Factory } from 'src/lib/fixtures/factories/r4/resources/observation-r4-factory';
import { fhirVersions } from 'src/lib/models/constants';
import { By } from '@angular/platform-browser';

describe('ObservationTableComponent', () => {
  let component: ObservationTableComponent;
  let fixture: ComponentFixture<ObservationTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ObservationTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ObservationTableComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display reference range column if any observations have a reference range', () => {
    component.observations = [
      new ObservationModel(observationR4Factory.valueQuantity().build(), fhirVersions.R4),
      new ObservationModel(observationR4Factory.valueCodeableConcept().build(), fhirVersions.R4),
      new ObservationModel(observationR4Factory.valueString().referenceRange().build(), fhirVersions.R4),
    ]
    fixture.detectChanges();

    expect(component.headers).toEqual(['Date', 'Result', 'Reference Range']);
    expect(fixture.debugElement.queryAll(By.css('th')).length).toEqual(3);
  });


  it('should not display reference range column if no observations have a reference range', () => {
    component.observations = [
      new ObservationModel(observationR4Factory.valueQuantity().build(), fhirVersions.R4),
      new ObservationModel(observationR4Factory.valueCodeableConcept().build(), fhirVersions.R4),
      new ObservationModel(observationR4Factory.valueString().build(), fhirVersions.R4),
    ]
    fixture.detectChanges();

    expect(component.headers).toEqual(['Date', 'Result']);
    expect(fixture.debugElement.queryAll(By.css('th')).length).toEqual(2);
  });
});
