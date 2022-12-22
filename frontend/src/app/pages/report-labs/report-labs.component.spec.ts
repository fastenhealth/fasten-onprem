import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportLabsComponent } from './report-labs.component';

describe('ReportLabsComponent', () => {
  let component: ReportLabsComponent;
  let fixture: ComponentFixture<ReportLabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportLabsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportLabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
