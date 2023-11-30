import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalRecordWizardAddAttachmentComponent } from './medical-record-wizard-add-attachment.component';
import {NgbActiveModal, NgbModal, NgbModalModule} from '@ng-bootstrap/ng-bootstrap';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {HTTP_CLIENT_TOKEN} from '../../dependency-injection';
import {HttpClient} from '@angular/common/http';

describe('MedicalRecordWizardAddAttachmentComponent', () => {
  let component: MedicalRecordWizardAddAttachmentComponent;
  let fixture: ComponentFixture<MedicalRecordWizardAddAttachmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [ NgbModal, NgbActiveModal, {
        provide: HTTP_CLIENT_TOKEN,
        useClass: HttpClient,
      } ],
      imports: [ MedicalRecordWizardAddAttachmentComponent, HttpClientTestingModule ],
      declarations: [  ]
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
