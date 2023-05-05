import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientVitalsWidgetComponent } from './patient-vitals-widget.component';

describe('PatientVitalsWidgetComponent', () => {
  let component: PatientVitalsWidgetComponent;
  let fixture: ComponentFixture<PatientVitalsWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientVitalsWidgetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientVitalsWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
