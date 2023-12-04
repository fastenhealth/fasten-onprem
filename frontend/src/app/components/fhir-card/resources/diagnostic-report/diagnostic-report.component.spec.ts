import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagnosticReportComponent } from './diagnostic-report.component';
import {NgbCollapseModule} from '@ng-bootstrap/ng-bootstrap';
import {RouterTestingModule} from '@angular/router/testing';

describe('DiagnosticReportComponent', () => {
  let component: DiagnosticReportComponent;
  let fixture: ComponentFixture<DiagnosticReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgbCollapseModule, DiagnosticReportComponent, RouterTestingModule]

    })
    .compileComponents();

    fixture = TestBed.createComponent(DiagnosticReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
