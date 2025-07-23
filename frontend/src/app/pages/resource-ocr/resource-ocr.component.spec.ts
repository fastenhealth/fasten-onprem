import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceOcrComponent } from './resource-ocr.component';

describe('ResourceOcrComponent', () => {
  let component: ResourceOcrComponent;
  let fixture: ComponentFixture<ResourceOcrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResourceOcrComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResourceOcrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
