import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalRecordWizardAddLabResultsComponent } from './medical-record-wizard-add-lab-results.component';

describe('MedicalRecordWizardAddLabResultsComponent', () => {
  let component: MedicalRecordWizardAddLabResultsComponent;
  let fixture: ComponentFixture<MedicalRecordWizardAddLabResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicalRecordWizardAddLabResultsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalRecordWizardAddLabResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
