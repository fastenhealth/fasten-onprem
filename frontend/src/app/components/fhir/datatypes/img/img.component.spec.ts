import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImgComponent } from './img.component';

describe('ImgComponent', () => {
  let component: ImgComponent;
  let fixture: ComponentFixture<ImgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ImgComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {


    expect(component).toBeTruthy();
  });
});
