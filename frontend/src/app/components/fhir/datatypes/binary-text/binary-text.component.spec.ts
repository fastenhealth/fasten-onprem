import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BinaryTextComponent } from './binary-text.component';

describe('BinaryTextComponent', () => {
  let component: BinaryTextComponent;
  let fixture: ComponentFixture<BinaryTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BinaryTextComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BinaryTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
