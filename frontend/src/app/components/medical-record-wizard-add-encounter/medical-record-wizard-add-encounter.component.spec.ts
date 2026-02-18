import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalRecordWizardAddEncounterComponent } from './medical-record-wizard-add-encounter.component';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {HTTP_CLIENT_TOKEN} from '../../dependency-injection';
import {HttpClient} from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';

describe('MedicalRecordWizardAddEncounterComponent', () => {
  let component: MedicalRecordWizardAddEncounterComponent;
  let fixture: ComponentFixture<MedicalRecordWizardAddEncounterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ MedicalRecordWizardAddEncounterComponent, HttpClientTestingModule, RouterTestingModule ],
      providers: [NgbModal, NgbActiveModal, {
        provide: HTTP_CLIENT_TOKEN,
        useClass: HttpClient,
      }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalRecordWizardAddEncounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
