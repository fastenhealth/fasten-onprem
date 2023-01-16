import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportLabsObservationComponent } from './report-labs-observation.component';
import {PipesModule} from '../../pipes/pipes.module';
import {NgbCollapseModule} from '@ng-bootstrap/ng-bootstrap';

describe('ReportLabsObservationComponent', () => {
  let component: ReportLabsObservationComponent;
  let fixture: ComponentFixture<ReportLabsObservationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PipesModule, NgbCollapseModule],
      declarations: [ ReportLabsObservationComponent ]
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
