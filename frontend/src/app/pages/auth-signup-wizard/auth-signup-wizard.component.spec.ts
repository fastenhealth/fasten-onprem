import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthSignupWizardComponent } from './auth-signup-wizard.component';
import { HttpClient } from '@angular/common/http';
import { HTTP_CLIENT_TOKEN } from 'src/app/dependency-injection';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AuthSignupWizardComponent', () => {
  let component: AuthSignupWizardComponent;
  let fixture: ComponentFixture<AuthSignupWizardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuthSignupWizardComponent ],
      imports: [HttpClientTestingModule, FormsModule],
      providers: [
        {
          provide: HTTP_CLIENT_TOKEN,
          useClass: HttpClient,
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthSignupWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
