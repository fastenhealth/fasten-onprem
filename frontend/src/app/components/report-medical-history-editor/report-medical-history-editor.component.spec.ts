import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportMedicalHistoryEditorComponent } from './report-medical-history-editor.component';

describe('ReportEditorRelatedComponent', () => {
  let component: ReportMedicalHistoryEditorComponent;
  let fixture: ComponentFixture<ReportMedicalHistoryEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportMedicalHistoryEditorComponent ]
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
