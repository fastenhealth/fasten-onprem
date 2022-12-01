import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientProfileComponent } from './patient-profile.component';

describe('PatientProfileComponent', () => {
  let component: PatientProfileComponent;
  let fixture: ComponentFixture<PatientProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientProfileComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
