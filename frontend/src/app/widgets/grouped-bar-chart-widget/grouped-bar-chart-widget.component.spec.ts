import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupedBarChartWidgetComponent } from './grouped-bar-chart-widget.component';

describe('GroupedBarChartWidgetComponent', () => {
  let component: GroupedBarChartWidgetComponent;
  let fixture: ComponentFixture<GroupedBarChartWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ GroupedBarChartWidgetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupedBarChartWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
