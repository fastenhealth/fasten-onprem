import { TestBed } from '@angular/core/testing';

import { MedicalSourcesFilterService } from './medical-sources-filter.service';

describe('MedicalSourcesFilterService', () => {
  let service: MedicalSourcesFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MedicalSourcesFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
