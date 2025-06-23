import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalRecordWizardEditEncounterComponent } from './medical-record-wizard-edit-encounter.component';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {HTTP_CLIENT_TOKEN} from '../../dependency-injection';
import {HttpClient} from '@angular/common/http';

describe('MedicalRecordWizardEditEncounterComponent', () => {
  let component: MedicalRecordWizardEditEncounterComponent;
  let fixture: ComponentFixture<MedicalRecordWizardEditEncounterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ MedicalRecordWizardEditEncounterComponent, HttpClientTestingModule ],
      providers: [NgbModal, NgbActiveModal, {
        provide: HTTP_CLIENT_TOKEN,
        useClass: HttpClient,
      }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalRecordWizardEditEncounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
