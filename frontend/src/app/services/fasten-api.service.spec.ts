import { TestBed } from '@angular/core/testing';

import { FastenApiService } from './fasten-api.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {HTTP_CLIENT_TOKEN} from '../dependency-injection';
import {HttpClient} from '@angular/common/http';

describe('FastenApiService', () => {
  let service: FastenApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_CLIENT_TOKEN,
          useClass: HttpClient,
        },
      ]
    });
    service = TestBed.inject(FastenApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
