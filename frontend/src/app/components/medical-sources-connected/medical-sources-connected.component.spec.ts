import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalSourcesConnectedComponent } from './medical-sources-connected.component';

describe('MedicalSourcesConnectedComponent', () => {
  let component: MedicalSourcesConnectedComponent;
  let fixture: ComponentFixture<MedicalSourcesConnectedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicalSourcesConnectedComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalSourcesConnectedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
