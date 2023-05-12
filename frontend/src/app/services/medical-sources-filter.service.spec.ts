import { TestBed } from '@angular/core/testing';

import { MedicalSourcesFilterService } from './medical-sources-filter.service';

import {FormBuilder, FormsModule, ReactiveFormsModule} from '@angular/forms';

describe('MedicalSourcesFilterService', () => {
  let service: MedicalSourcesFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [],
      providers: [FormBuilder],
      imports: [FormsModule, ReactiveFormsModule],
    });
    service = TestBed.inject(MedicalSourcesFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
