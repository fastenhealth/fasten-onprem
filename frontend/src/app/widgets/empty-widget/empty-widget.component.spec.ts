import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmptyWidgetComponent } from './empty-widget.component';

describe('EmptyWidgetComponent', () => {
  let component: EmptyWidgetComponent;
  let fixture: ComponentFixture<EmptyWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmptyWidgetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmptyWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
