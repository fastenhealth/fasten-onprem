/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SetupEncryptionKeyComponent } from './setup-encryption-key.component';

describe('SetupEncryptionKeyComponent', () => {
  let component: SetupEncryptionKeyComponent;
  let fixture: ComponentFixture<SetupEncryptionKeyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SetupEncryptionKeyComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetupEncryptionKeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
