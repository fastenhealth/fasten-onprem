import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EncryptionManagerComponent } from './encryption-manager.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('EncryptionManagerComponent', () => {
  let component: EncryptionManagerComponent;
  let fixture: ComponentFixture<EncryptionManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EncryptionManagerComponent ],
      imports: [HttpClientTestingModule],

    })
    .compileComponents();

    fixture = TestBed.createComponent(EncryptionManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
