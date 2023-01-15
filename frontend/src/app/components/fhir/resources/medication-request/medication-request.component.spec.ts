import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicationRequestComponent } from './medication-request.component';

describe('MedicationRequestComponent', () => {
  let component: MedicationRequestComponent;
  let fixture: ComponentFixture<MedicationRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicationRequestComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicationRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
