import { TestBed } from '@angular/core/testing';

import { OcrDataService } from './ocr-data.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HTTP_CLIENT_TOKEN } from '../dependency-injection';
import { HttpClient } from '@angular/common/http';

describe('OcrDataService', () => {
  let service: OcrDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_CLIENT_TOKEN,
          useClass: HttpClient,
        },
      ],
    });
    service = TestBed.inject(OcrDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
