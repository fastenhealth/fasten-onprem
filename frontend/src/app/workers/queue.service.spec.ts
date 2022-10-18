import { TestBed } from '@angular/core/testing';

import { QueueService } from './queue.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('QueueService', () => {
  let service: QueueService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(QueueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
