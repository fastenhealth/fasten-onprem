import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportLabsObservationComponent } from './report-labs-observation.component';

describe('ReportLabsObservationComponent', () => {
  let component: ReportLabsObservationComponent;
  let fixture: ComponentFixture<ReportLabsObservationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
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
