import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ObservationBarChartComponent } from './observation-bar-chart.component';

describe('ObservationBarChartComponent', () => {
  let component: ObservationBarChartComponent;
  let fixture: ComponentFixture<ObservationBarChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ObservationBarChartComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ObservationBarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
