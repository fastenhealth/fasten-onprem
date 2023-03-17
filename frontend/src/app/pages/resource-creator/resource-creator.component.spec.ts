import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceCreatorComponent } from './resource-creator.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';

describe('ResourceCreatorComponent', () => {
  let component: ResourceCreatorComponent;
  let fixture: ComponentFixture<ResourceCreatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      declarations: [ ResourceCreatorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResourceCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
