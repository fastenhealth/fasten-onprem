import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {HTTP_CLIENT_TOKEN} from '../dependency-injection';
import {HttpClient} from '@angular/common/http';

describe('AuthService', () => {
  let service: AuthService;
  let mockWindow: any;

  beforeEach(() => {
    mockWindow = {
      location: {
        href: jasmine.createSpy('href'),
        assign: jasmine.createSpy('assign'),
      },
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_CLIENT_TOKEN,
          useClass: HttpClient,
        },
        {
          provide: 'window',
          useValue: mockWindow,
        },
      ]
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set window.location.href', () => {
    service.IdpConnect("some_idp");
    expect(mockWindow.location.href).toHaveBeenCalledWith(jasmine.any(String));
  });
});
