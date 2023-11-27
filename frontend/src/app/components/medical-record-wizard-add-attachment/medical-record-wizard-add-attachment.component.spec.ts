import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalRecordWizardAddAttachmentComponent } from './medical-record-wizard-add-attachment.component';

describe('MedicalRecordWizardAddAttachmentComponent', () => {
  let component: MedicalRecordWizardAddAttachmentComponent;
  let fixture: ComponentFixture<MedicalRecordWizardAddAttachmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicalRecordWizardAddAttachmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalRecordWizardAddAttachmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
