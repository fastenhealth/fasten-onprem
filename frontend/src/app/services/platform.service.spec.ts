import { TestBed } from '@angular/core/testing';

import { PlatformService } from './platform.service';
import { HTTP_CLIENT_TOKEN } from '../dependency-injection';
import { HttpClient, HttpHandler } from '@angular/common/http';

describe('PlatformService', () => {
  let service: PlatformService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HttpClient, HttpHandler, {
        provide: HTTP_CLIENT_TOKEN,
        useClass: HttpHandler,
      }]
    });
    service = TestBed.inject(PlatformService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
