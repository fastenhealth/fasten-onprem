import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageListGroupWidgetComponent } from './image-list-group-widget.component';

describe('ImageListGroupWidgetComponent', () => {
  let component: ImageListGroupWidgetComponent;
  let fixture: ComponentFixture<ImageListGroupWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImageListGroupWidgetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageListGroupWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
