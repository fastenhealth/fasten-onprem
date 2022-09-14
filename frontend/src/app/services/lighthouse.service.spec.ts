import { TestBed } from '@angular/core/testing';

import { LighthouseService } from './lighthouse.service';

describe('LighthouseService', () => {
  let service: LighthouseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LighthouseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
