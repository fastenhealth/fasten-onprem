import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalRecordWizardAddOrganizationComponent } from './medical-record-wizard-add-organization.component';
import {NgbActiveModal, NgbModal, NgbModalModule} from '@ng-bootstrap/ng-bootstrap';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {HTTP_CLIENT_TOKEN} from '../../dependency-injection';
import {HttpClient} from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';

describe('MedicalRecordWizardAddOrganizationComponent', () => {
  let component: MedicalRecordWizardAddOrganizationComponent;
  let fixture: ComponentFixture<MedicalRecordWizardAddOrganizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [NgbModal, NgbActiveModal, {
        provide: HTTP_CLIENT_TOKEN,
        useClass: HttpClient,
      }],
      imports: [ MedicalRecordWizardAddOrganizationComponent, HttpClientTestingModule, RouterTestingModule ]
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
