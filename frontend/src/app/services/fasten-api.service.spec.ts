import { TestBed } from '@angular/core/testing';

import { FastenApiService } from './fasten-api.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('FastenApiService', () => {
  let service: FastenApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(FastenApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
