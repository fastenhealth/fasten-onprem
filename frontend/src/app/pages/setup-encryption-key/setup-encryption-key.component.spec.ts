/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { SetupEncryptionKeyComponent } from './setup-encryption-key.component';
import { FastenApiService } from '../../services/fasten-api.service';
import { AuthService } from '../../services/auth.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('SetupEncryptionKeyComponent', () => {
  let component: SetupEncryptionKeyComponent;
  let fixture: ComponentFixture<SetupEncryptionKeyComponent>;

  const mockRouter = {
    navigateByUrl: jasmine.createSpy('navigateByUrl')
  };

  const mockAuthService = {
    Logout: jasmine.createSpy('Logout').and.returnValue(Promise.resolve())
  };

  const mockFastenApiService = {
    setupEncryptionKey: jasmine.createSpy('setupEncryptionKey').and.returnValue(of({ data: 'mockKey' })),
    validateEncryptionKey: jasmine.createSpy('validateEncryptionKey').and.returnValue(of({ data: 'mockKey' }))
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SetupEncryptionKeyComponent],
      imports: [ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: mockAuthService },
        { provide: FastenApiService, useValue: mockFastenApiService }
      ]
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
