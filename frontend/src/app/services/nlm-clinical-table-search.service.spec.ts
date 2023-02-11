import { TestBed } from '@angular/core/testing';

import { NlmClinicalTableSearchService } from './nlm-clinical-table-search.service';

describe('NlmClinicalTableSearchService', () => {
  let service: NlmClinicalTableSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NlmClinicalTableSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
