import { TestBed } from '@angular/core/testing';

import { LighthouseService } from './lighthouse.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {RouterModule} from '@angular/router';

describe('LighthouseService', () => {
  let service: LighthouseService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(LighthouseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
