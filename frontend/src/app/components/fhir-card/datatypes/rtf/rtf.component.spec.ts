import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RtfComponent } from './rtf.component';

describe('RtfComponent', () => {
  let component: RtfComponent;
  let fixture: ComponentFixture<RtfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RtfComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RtfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
