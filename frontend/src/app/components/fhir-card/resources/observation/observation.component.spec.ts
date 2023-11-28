import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObservationComponent } from './observation.component';

describe('ObservationComponent', () => {
  let component: ObservationComponent;
  let fixture: ComponentFixture<ObservationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ObservationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ObservationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
