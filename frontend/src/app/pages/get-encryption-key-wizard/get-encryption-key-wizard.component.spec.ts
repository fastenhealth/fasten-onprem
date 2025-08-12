import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { GetEncryptionKeyWizardComponent } from './get-encryption-key-wizard.component';
import { FastenApiService } from '../../services/fasten-api.service';
import { AuthService } from '../../services/auth.service';

describe('GetEncryptionKeyWizardComponent', () => {
  let component: GetEncryptionKeyWizardComponent;
  let fixture: ComponentFixture<GetEncryptionKeyWizardComponent>;

  const mockRouter = {
    navigateByUrl: jasmine.createSpy('navigateByUrl')
  };

  const mockAuthService = {
    Logout: jasmine.createSpy('Logout').and.returnValue(Promise.resolve())
  };

  const mockFastenApiService = {
    getEncryptionKey: jasmine.createSpy('getEncryptionKey').and.returnValue(of({ data: 'mockKey' }))
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GetEncryptionKeyWizardComponent ],
      imports: [ HttpClientTestingModule ],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: mockAuthService },
        { provide: FastenApiService, useValue: mockFastenApiService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GetEncryptionKeyWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
