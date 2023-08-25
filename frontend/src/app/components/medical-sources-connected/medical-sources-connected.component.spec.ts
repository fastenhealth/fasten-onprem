import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalSourcesConnectedComponent } from './medical-sources-connected.component';
import {HTTP_CLIENT_TOKEN} from '../../dependency-injection';
import {HttpClient} from '@angular/common/http';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';

describe('MedicalSourcesConnectedComponent', () => {
  let component: MedicalSourcesConnectedComponent;
  let fixture: ComponentFixture<MedicalSourcesConnectedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicalSourcesConnectedComponent ],
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        {
          provide: HTTP_CLIENT_TOKEN,
          useClass: HttpClient,
        },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalSourcesConnectedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle nanosecond and microsecond token expirations', () => {
    var tokenResponse = {
      token_type: "Bearer",
      expires_in: "3600",
      access_token: "OXgK8mrfvMrxIMK38T6CAjKiLMDV",
      refresh_token: "5Oq5ZgcTgi9-xxxxxxx",
      patient: "a-80000.xxxx"
    }

    var expiresAt = component.getAccessTokenExpiration(tokenResponse)
    expect(expiresAt.toString().length).toEqual(10)
  })

});
