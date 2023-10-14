import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordsSummaryWidgetComponent } from './records-summary-widget.component';

describe('RecordsSummaryWidgetComponent', () => {
  let component: RecordsSummaryWidgetComponent;
  let fixture: ComponentFixture<RecordsSummaryWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecordsSummaryWidgetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecordsSummaryWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
