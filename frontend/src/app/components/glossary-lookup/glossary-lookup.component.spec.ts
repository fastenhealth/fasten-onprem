import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlossaryLookupComponent } from './glossary-lookup.component';
import {FastenApiService} from '../../services/fasten-api.service';
import {of} from 'rxjs';
import {HTTP_CLIENT_TOKEN} from '../../dependency-injection';
import {HttpClient} from '@angular/common/http';

describe('GlossaryLookupComponent', () => {
  let component: GlossaryLookupComponent;
  let fixture: ComponentFixture<GlossaryLookupComponent>;
  let mockedFastenApiService

  beforeEach(async () => {
    mockedFastenApiService = jasmine.createSpyObj('FastenApiService', ['getGlossarySearchByCode'])

    await TestBed.configureTestingModule({
      imports: [ GlossaryLookupComponent ],
      providers: [
        {
          provide: FastenApiService,
          useValue: mockedFastenApiService
        }
      ]
    })
    .compileComponents();
    mockedFastenApiService.getGlossarySearchByCode.and.returnValue(of({
      url: 'http://www.example.com',
      publisher: 'test-publisher',
      description: 'test description'
    }));

    fixture = TestBed.createComponent(GlossaryLookupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
