import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportLabsObservationComponent } from './report-labs-observation.component';
import { PipesModule } from '../../pipes/pipes.module';
import { NgbCollapse } from '@ng-bootstrap/ng-bootstrap';
import { RouterTestingModule } from '@angular/router/testing';
import { ObservationVisualizationComponent } from '../fhir-card/common/observation-visualization/observation-visualization.component';

describe('ReportLabsObservationComponent', () => {
  let component: ReportLabsObservationComponent;
  let fixture: ComponentFixture<ReportLabsObservationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PipesModule, RouterTestingModule, ObservationVisualizationComponent, NgbCollapse],
      declarations: [ ReportLabsObservationComponent ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportLabsObservationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
