import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalRecordWizardEditOrganizationComponent } from './medical-record-wizard-edit-organization.component';
import {NgbActiveModal, NgbModal, NgbModalModule} from '@ng-bootstrap/ng-bootstrap';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {HTTP_CLIENT_TOKEN} from '../../dependency-injection';
import {HttpClient} from '@angular/common/http';

describe('MedicalRecordWizardEditOrganizationComponent', () => {
  let component: MedicalRecordWizardEditOrganizationComponent;
  let fixture: ComponentFixture<MedicalRecordWizardEditOrganizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [NgbModal, NgbActiveModal, {
        provide: HTTP_CLIENT_TOKEN,
        useClass: HttpClient,
      }],
      imports: [ MedicalRecordWizardEditOrganizationComponent, HttpClientTestingModule ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalRecordWizardEditOrganizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
