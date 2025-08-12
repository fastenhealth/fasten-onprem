import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PractitionerCreateComponent } from './practitioner-create.component';
import { HTTP_CLIENT_TOKEN } from 'src/app/dependency-injection';
import { HttpClient } from '@angular/common/http';

describe('PractitionerCreateComponent', () => {
  let component: PractitionerCreateComponent;
  let fixture: ComponentFixture<PractitionerCreateComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [PractitionerCreateComponent],
      providers: [
        {
          provide: HTTP_CLIENT_TOKEN,
          useClass: HttpClient,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PractitionerCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
