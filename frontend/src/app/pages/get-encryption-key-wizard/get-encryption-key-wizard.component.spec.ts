import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetTokenWizardComponent } from './get-token-wizard.component';

describe('GetTokenWizardComponent', () => {
  let component: GetTokenWizardComponent;
  let fixture: ComponentFixture<GetTokenWizardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GetTokenWizardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GetTokenWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
