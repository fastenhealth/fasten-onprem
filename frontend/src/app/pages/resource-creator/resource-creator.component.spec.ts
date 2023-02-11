import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceCreatorComponent } from './resource-creator.component';

describe('ResourceCreatorComponent', () => {
  let component: ResourceCreatorComponent;
  let fixture: ComponentFixture<ResourceCreatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
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
