import { TestBed } from '@angular/core/testing';

import { FastenDbService } from './fasten-db.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('FastenDbService', () => {
  let service: FastenDbService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(FastenDbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
