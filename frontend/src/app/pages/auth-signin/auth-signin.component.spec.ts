import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthSigninComponent } from './auth-signin.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {HTTP_CLIENT_TOKEN} from '../../dependency-injection';
import {HttpClient} from '@angular/common/http';

describe('AuthSigninComponent', () => {
  let component: AuthSigninComponent;
  let fixture: ComponentFixture<AuthSigninComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuthSigninComponent ],
      imports: [HttpClientTestingModule, FormsModule, RouterTestingModule],
      providers: [
        {
          provide: HTTP_CLIENT_TOKEN,
          useClass: HttpClient,
        },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthSigninComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
