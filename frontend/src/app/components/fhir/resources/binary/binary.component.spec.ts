import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BinaryComponent } from './binary.component';
import {NgbCollapseModule} from '@ng-bootstrap/ng-bootstrap';
import {FastenApiService} from '../../../../services/fasten-api.service';
import {RouterTestingModule} from '@angular/router/testing';

describe('BinaryComponent', () => {
  let component: BinaryComponent;
  let fixture: ComponentFixture<BinaryComponent>;
  let mockedFastenApiService

  beforeEach(async () => {
    mockedFastenApiService = jasmine.createSpyObj('FastenApiService', ['getBinaryModel'])

    await TestBed.configureTestingModule({
      imports: [BinaryComponent, NgbCollapseModule, RouterTestingModule],
      providers: [{
        provide: FastenApiService,
        useValue: mockedFastenApiService
      }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BinaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
