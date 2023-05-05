import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplexLineWidgetComponent } from './complex-line-widget.component';

describe('ComplexLineWidgetComponent', () => {
  let component: ComplexLineWidgetComponent;
  let fixture: ComponentFixture<ComplexLineWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComplexLineWidgetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComplexLineWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
