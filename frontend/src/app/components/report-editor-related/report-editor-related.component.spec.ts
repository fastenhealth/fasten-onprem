import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportEditorRelatedComponent } from './report-editor-related.component';

describe('ReportEditorRelatedComponent', () => {
  let component: ReportEditorRelatedComponent;
  let fixture: ComponentFixture<ReportEditorRelatedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportEditorRelatedComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportEditorRelatedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
