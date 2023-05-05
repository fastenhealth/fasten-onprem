import { TestBed } from '@angular/core/testing';

import { NlmClinicalTableSearchService } from './nlm-clinical-table-search.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {HTTP_CLIENT_TOKEN} from '../dependency-injection';
import {HttpClient} from '@angular/common/http';

describe('NlmClinicalTableSearchService', () => {
  let service: NlmClinicalTableSearchService;

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
    service = TestBed.inject(NlmClinicalTableSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
