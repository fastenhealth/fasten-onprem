import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportMedicalHistoryEditorComponent } from './report-medical-history-editor.component';
import {NgbActiveModal, NgbModalModule} from '@ng-bootstrap/ng-bootstrap';
import {FastenApiService} from '../../services/fasten-api.service';
import {HttpClient} from '@angular/common/http';
// import { TreeModule } from '@circlon/angular-tree-component';
import { FormsModule } from '@angular/forms';

describe('ReportMedicalHistoryEditorComponent', () => {
  let component: ReportMedicalHistoryEditorComponent;
  let fixture: ComponentFixture<ReportMedicalHistoryEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportMedicalHistoryEditorComponent ],
      imports: [
        // TreeModule,
        FormsModule
      ],
      providers: [NgbActiveModal, {
        provide: FastenApiService,
        useValue: jasmine.createSpyObj('FastenApiService', ['createResourceComposition'])
      }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportMedicalHistoryEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
