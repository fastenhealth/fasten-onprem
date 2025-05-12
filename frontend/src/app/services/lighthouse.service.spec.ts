import { TestBed } from '@angular/core/testing';

import { LighthouseService } from './lighthouse.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {RouterModule} from '@angular/router';
import {HTTP_CLIENT_TOKEN} from '../dependency-injection';
import {HttpClient} from '@angular/common/http';

describe('LighthouseService', () => {
  let service: LighthouseService;
  let mockWindow: any;

  beforeEach(() => {
    mockWindow = {
      location: {
        href: jasmine.createSpy('href'),
        assign: jasmine.createSpy('assign'),
      },
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_CLIENT_TOKEN,
          useClass: HttpClient,
        },
        {
          provide: 'window',
          useValue: mockWindow,
        },
      ]
    });
    service = TestBed.inject(LighthouseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
