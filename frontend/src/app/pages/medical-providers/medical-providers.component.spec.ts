import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalProvidersComponent } from './medical-providers.component';

describe('MedicalProvidersComponent', () => {
  let component: MedicalProvidersComponent;
  let fixture: ComponentFixture<MedicalProvidersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicalProvidersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalProvidersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
