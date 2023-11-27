import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalRecordWizardAddOrganizationComponent } from './medical-record-wizard-add-organization.component';

describe('MedicalRecordWizardAddOrganizationComponent', () => {
  let component: MedicalRecordWizardAddOrganizationComponent;
  let fixture: ComponentFixture<MedicalRecordWizardAddOrganizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicalRecordWizardAddOrganizationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalRecordWizardAddOrganizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
