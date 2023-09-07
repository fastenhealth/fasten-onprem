import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesktopCallbackComponent } from './desktop-callback.component';

describe('DesktopCallbackComponent', () => {
  let component: DesktopCallbackComponent;
  let fixture: ComponentFixture<DesktopCallbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DesktopCallbackComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DesktopCallbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
