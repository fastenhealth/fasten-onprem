import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ObservationVisualizationComponent } from './observation-visualization.component';
import { ObservationModel } from 'src/lib/models/resources/observation-model';
import { observationR4Factory } from 'src/lib/fixtures/factories/r4/resources/observation-r4-factory';
import { fhirVersions } from 'src/lib/models/constants';
import { By } from '@angular/platform-browser';

describe('ObservationVisualizationComponent', () => {
  let component: ObservationVisualizationComponent;
  let fixture: ComponentFixture<ObservationVisualizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ObservationVisualizationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ObservationVisualizationComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render a bar chart if the first observation supports it', () => {
    component.observations = [new ObservationModel(observationR4Factory.valueQuantity().build(), fhirVersions.R4)]
    fixture.detectChanges();
    expect(component.visualizationType).toEqual('bar');
    expect(fixture.debugElement.query(By.css('observation-bar-chart'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('observation-table'))).toBeFalsy();
  });

  it('should render a table chart if that is all the first observation supports', () => {
    component.observations = [new ObservationModel(observationR4Factory.valueCodeableConcept().build(), fhirVersions.R4)]
    fixture.detectChanges();
    expect(component.visualizationType).toEqual('table');
    expect(fixture.debugElement.query(By.css('observation-table'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('observation-bar-chart'))).toBeFalsy();

  });

  describe('pickVisualizationType', () => {
    let barAndTable: ObservationModel;
    let tableOnly: ObservationModel;

    beforeEach(async () => {
      barAndTable = new ObservationModel(observationR4Factory.valueQuantity().build(), fhirVersions.R4);
      tableOnly = new ObservationModel(observationR4Factory.valueCodeableConcept().build(), fhirVersions.R4)
    });

    it('returns the preferredVisualization if the first observation supports that visualization type', () => {
      expect(component['pickVisualizationType']('bar', [barAndTable, tableOnly])).toEqual('bar');
    });

    it('returns the first supported type for the first observation if the preferred visualization is not supported', () => {
      expect(component['pickVisualizationType']('bar', [tableOnly, barAndTable])).toEqual('table');

    });
  });
});
