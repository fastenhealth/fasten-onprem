import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DicomComponent } from './dicom.component';

describe('DicomComponent', () => {
  let component: DicomComponent;
  let fixture: ComponentFixture<DicomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DicomComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DicomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
