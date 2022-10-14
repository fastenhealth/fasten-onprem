import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SourceDetailComponent } from './source-detail.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {ActivatedRoute, convertToParamMap, RouterModule} from '@angular/router';

describe('SourceDetailComponent', () => {
  let component: SourceDetailComponent;
  let fixture: ComponentFixture<SourceDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, RouterModule],
      declarations: [ SourceDetailComponent ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {snapshot: {paramMap: convertToParamMap( { 'source_id': 'b64.c291cmNlOmF0aGVuYTphLTgwMDAwLkUtMTQ1NDU' } )}}
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SourceDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
