import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FallbackComponent } from './fallback.component';

describe('FallbackComponent', () => {
  let component: FallbackComponent;
  let fixture: ComponentFixture<FallbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FallbackComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FallbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
