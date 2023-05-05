import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceListComponent } from './resource-list.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {ResourceListOutletDirective} from './resource-list-outlet.directive';
import {FastenApiService} from '../../services/fasten-api.service';

describe('ResourceListComponent', () => {
  let component: ResourceListComponent;
  let fixture: ComponentFixture<ResourceListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [ ResourceListComponent, ResourceListOutletDirective ],
      providers: [FastenApiService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResourceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
