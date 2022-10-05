import { TestBed } from '@angular/core/testing';

import { FastenDbService } from './fasten-db.service';

describe('FastenDbService', () => {
  let service: FastenDbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FastenDbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
