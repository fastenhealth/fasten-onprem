import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { PipesModule } from '../../pipes/pipes.module';
import { FastenApiService } from '../../services/fasten-api.service';
import { UserListComponent } from './user-list.component';

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let mockedFastenApiService;

  beforeEach(async () => {
    mockedFastenApiService = jasmine.createSpyObj('FastenApiService', { 'getAllUsers': of([{}]) })
    await TestBed.configureTestingModule({
      declarations: [UserListComponent],
      imports: [PipesModule, RouterTestingModule],
      providers: [{
        provide: FastenApiService,
        useValue: mockedFastenApiService
      }]
    })
      .compileComponents();
    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
