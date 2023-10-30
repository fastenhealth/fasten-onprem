import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordsSummaryWidgetComponent } from './records-summary-widget.component';
import {FastenApiService} from '../../services/fasten-api.service';
import {HTTP_CLIENT_TOKEN} from '../../dependency-injection';
import {HttpClient} from '@angular/common/http';
import {RouterTestingModule} from '@angular/router/testing';
import {of} from 'rxjs';

describe('RecordsSummaryWidgetComponent', () => {
  let component: RecordsSummaryWidgetComponent;
  let fixture: ComponentFixture<RecordsSummaryWidgetComponent>;
  let mockedFastenApiService

  beforeEach(async () => {
    mockedFastenApiService = jasmine.createSpyObj('FastenApiService', ['getSummary'])
    await TestBed.configureTestingModule({
      imports: [ RecordsSummaryWidgetComponent, RouterTestingModule ],
      providers: [
        {
          provide: FastenApiService,
          useValue: mockedFastenApiService
        },
        {
          provide: HTTP_CLIENT_TOKEN,
          useClass: HttpClient,
        }
      ]
    })
    .compileComponents();
    mockedFastenApiService.getSummary.and.returnValue(of({}));

    fixture = TestBed.createComponent(RecordsSummaryWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
