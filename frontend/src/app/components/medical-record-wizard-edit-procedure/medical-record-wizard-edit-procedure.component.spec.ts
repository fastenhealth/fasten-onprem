import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalRecordWizardEditProcedureComponent } from './medical-record-wizard-edit-procedure.component';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {HTTP_CLIENT_TOKEN} from '../../dependency-injection';
import {HttpClient} from '@angular/common/http';

describe('MedicalRecordWizardEditProcedureComponent', () => {
  let component: MedicalRecordWizardEditProcedureComponent;
  let fixture: ComponentFixture<MedicalRecordWizardEditProcedureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ MedicalRecordWizardEditProcedureComponent, HttpClientTestingModule ],
      providers: [NgbModal, NgbActiveModal, {
        provide: HTTP_CLIENT_TOKEN,
        useClass: HttpClient,
      }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalRecordWizardEditProcedureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
