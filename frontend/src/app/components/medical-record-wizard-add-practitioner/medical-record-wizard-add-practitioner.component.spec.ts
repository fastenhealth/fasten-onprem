import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalRecordWizardAddPractitionerComponent } from './medical-record-wizard-add-practitioner.component';

describe('MedicalRecordWizardAddPractitionerComponent', () => {
  let component: MedicalRecordWizardAddPractitionerComponent;
  let fixture: ComponentFixture<MedicalRecordWizardAddPractitionerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicalRecordWizardAddPractitionerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalRecordWizardAddPractitionerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
