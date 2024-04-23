import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RtfComponent } from './rtf.component';
import { BinaryModel } from 'src/lib/models/resources/binary-model';
import { RTFJS } from 'rtf.js';

describe('RtfComponent', () => {
  let component: RtfComponent;
  let fixture: ComponentFixture<RtfComponent>;

  const rtf: string = "{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}} \\f0\\fs60 Hello, World! }";

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ RtfComponent ]
    })
    .compileComponents();

    RTFJS.loggingEnabled(false);

    fixture = TestBed.createComponent(RtfComponent);
    component = fixture.componentInstance;
    component.displayModel = new BinaryModel({});
    component.displayModel.content = rtf;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
