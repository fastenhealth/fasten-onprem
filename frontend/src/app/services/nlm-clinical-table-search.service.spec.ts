import { TestBed } from '@angular/core/testing';

import { NlmClinicalTableSearchService } from './nlm-clinical-table-search.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('NlmClinicalTableSearchService', () => {
  let service: NlmClinicalTableSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(NlmClinicalTableSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
