/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SetupTokenComponent } from './setup-token.component';

describe('SetupTokenComponent', () => {
  let component: SetupTokenComponent;
  let fixture: ComponentFixture<SetupTokenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SetupTokenComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetupTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
