import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DualGaugesWidgetComponent } from './dual-gauges-widget.component';

describe('DualGaugesWidgetComponent', () => {
  let component: DualGaugesWidgetComponent;
  let fixture: ComponentFixture<DualGaugesWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ DualGaugesWidgetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DualGaugesWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
