import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthSignupWizardComponent } from './auth-signup-wizard.component';

describe('AuthSignupWizardComponent', () => {
  let component: AuthSignupWizardComponent;
  let fixture: ComponentFixture<AuthSignupWizardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuthSignupWizardComponent ]
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
