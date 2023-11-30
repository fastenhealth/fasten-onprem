import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalRecordWizardAddEncounterComponent } from './medical-record-wizard-add-encounter.component';

describe('MedicalRecordWizardAddEncounterComponent', () => {
  let component: MedicalRecordWizardAddEncounterComponent;
  let fixture: ComponentFixture<MedicalRecordWizardAddEncounterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicalRecordWizardAddEncounterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalRecordWizardAddEncounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
