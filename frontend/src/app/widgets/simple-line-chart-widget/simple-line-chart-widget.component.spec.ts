import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleLineChartWidgetComponent } from './simple-line-chart-widget.component';

describe('SimpleLineChartWidgetComponent', () => {
  let component: SimpleLineChartWidgetComponent;
  let fixture: ComponentFixture<SimpleLineChartWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ SimpleLineChartWidgetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimpleLineChartWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
