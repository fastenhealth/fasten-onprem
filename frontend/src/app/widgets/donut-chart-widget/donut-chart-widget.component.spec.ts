import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonutChartWidgetComponent } from './donut-chart-widget.component';

describe('DonutChartWidgetComponent', () => {
  let component: DonutChartWidgetComponent;
  let fixture: ComponentFixture<DonutChartWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DonutChartWidgetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DonutChartWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
