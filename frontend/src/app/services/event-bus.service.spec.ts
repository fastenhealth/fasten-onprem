import { TestBed } from '@angular/core/testing';

import { EventBusService } from './event-bus.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {HTTP_CLIENT_TOKEN} from '../dependency-injection';
import {HttpClient} from '@angular/common/http';

describe('EventBusService', () => {
  let service: EventBusService;

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
    service = TestBed.inject(EventBusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
