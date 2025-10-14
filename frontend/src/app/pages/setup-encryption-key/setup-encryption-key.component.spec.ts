/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed, fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

import { SetupEncryptionKeyComponent } from './setup-encryption-key.component';
import { FastenApiService } from '../../services/fasten-api.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('SetupEncryptionKeyComponent', () => {
  let component: SetupEncryptionKeyComponent;
  let fixture: ComponentFixture<SetupEncryptionKeyComponent>;
  let mockFastenApiService: any;
  let mockRouter: any;
  let mockChangeDetectorRef: any;

  beforeEach(async () => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    mockFastenApiService = {
      setupEncryptionKey: jasmine.createSpy('setupEncryptionKey'),
      validateEncryptionKey: jasmine.createSpy('validateEncryptionKey')
    };

    mockChangeDetectorRef = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);

    await TestBed.configureTestingModule({
      declarations: [SetupEncryptionKeyComponent],
      imports: [ReactiveFormsModule, FormsModule, HttpClientTestingModule],
      providers: [
        FormBuilder,
        { provide: Router, useValue: mockRouter },
        { provide: FastenApiService, useValue: mockFastenApiService },
        { provide: ChangeDetectorRef, useValue: mockChangeDetectorRef }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SetupEncryptionKeyComponent);
    component = fixture.componentInstance;
    // Mock the sleep method
    spyOn<any>(component, 'sleep').and.returnValue(Promise.resolve());
    // Reset mocks before each test
    mockFastenApiService.setupEncryptionKey.calls.reset();
    mockFastenApiService.validateEncryptionKey.calls.reset();
    mockRouter.navigate.calls.reset();
    mockChangeDetectorRef.detectChanges.calls.reset();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
