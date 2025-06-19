import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalRecordWizardEditPractitionerComponent } from './medical-record-wizard-edit-practitioner.component';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {HTTP_CLIENT_TOKEN} from '../../dependency-injection';
import {HttpClient} from '@angular/common/http';

describe('MedicalRecordWizardEditPractitionerComponent', () => {
  let component: MedicalRecordWizardEditPractitionerComponent;
  let fixture: ComponentFixture<MedicalRecordWizardEditPractitionerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ MedicalRecordWizardEditPractitionerComponent, HttpClientTestingModule ],
      providers: [ NgbActiveModal, NgbModal, {
        provide: HTTP_CLIENT_TOKEN,
        useClass: HttpClient,
      } ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalRecordWizardEditPractitionerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
