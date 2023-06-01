import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingWidgetComponent } from './loading-widget.component';

describe('LoadingWidgetComponent', () => {
  let component: LoadingWidgetComponent;
  let fixture: ComponentFixture<LoadingWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoadingWidgetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadingWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
