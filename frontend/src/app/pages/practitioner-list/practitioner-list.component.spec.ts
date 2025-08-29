import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PractitionerListComponent } from './practitioner-list.component';
import { HTTP_CLIENT_TOKEN } from 'src/app/dependency-injection';
import { HttpClient, HttpClientModule } from '@angular/common/http';

describe('PractitionerListComponent', () => {
  let component: PractitionerListComponent;
  let fixture: ComponentFixture<PractitionerListComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [PractitionerListComponent, HttpClientModule],
      providers: [
        {
          provide: HTTP_CLIENT_TOKEN,
          useClass: HttpClient,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PractitionerListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
