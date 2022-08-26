import { TestBed } from '@angular/core/testing';

import { PassportService } from './passport.service';

describe('PassportService', () => {
  let service: PassportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PassportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
