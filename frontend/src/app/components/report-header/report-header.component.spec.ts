import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportHeaderComponent } from './report-header.component';

describe('ReportHeaderComponent', () => {
  let component: ReportHeaderComponent;
  let fixture: ComponentFixture<ReportHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportHeaderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
