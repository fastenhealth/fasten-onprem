import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalRecordWizardComponent } from './medical-record-wizard.component';

describe('MedicalRecordWizardComponent', () => {
  let component: MedicalRecordWizardComponent;
  let fixture: ComponentFixture<MedicalRecordWizardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicalRecordWizardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalRecordWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
