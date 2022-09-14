import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Observable} from 'rxjs';
import { Router } from '@angular/router';
import {LighthouseSource} from '../models/lighthouse/lighthouse-source';
import {environment} from '../../environments/environment';
import {map} from 'rxjs/operators';
import {ResponseWrapper} from '../models/response-wrapper';
import {Source} from '../models/fasten/source';
import {User} from '../models/fasten/user';
import {ResourceFhir} from '../models/fasten/resource_fhir';

@Injectable({
  providedIn: 'root'
})
export class FastenApiService {

  AUTH_TOKEN_KEY = 'token';

  constructor(private _httpClient: HttpClient, private router: Router) {
  }

  getBasePath(): string {
    return window.location.pathname.split('/web').slice(0, 1)[0];
  }

  // Auth functions
  token() {
    return localStorage.getItem(this.AUTH_TOKEN_KEY);
  }
  isAuthenticated() {
    return !!localStorage.getItem(this.AUTH_TOKEN_KEY);
  }

  logout() {
    localStorage.removeItem(this.AUTH_TOKEN_KEY);
  }

  signup(newUser: User): Observable<any> {
    return this._httpClient.post<any>(`${this.getBasePath()}/api/auth/signup`, newUser).pipe(
      map((res: any) => {
        localStorage.setItem(this.AUTH_TOKEN_KEY, res.data);
        return res.data
      }
    ));
  }


  signin(username: string, pass: string): Observable<any> {

    const data = {
      username: username,
      password: pass
    };

    return this._httpClient.post<any>(`${this.getBasePath()}/api/auth/signin`, data).pipe(
      map((res: any) => {
        localStorage.setItem(this.AUTH_TOKEN_KEY, res.data);
        return res.data
      }
    ));
  }


  /*
  SECURE ENDPOINTS
  */

  createSource(source: Source): Observable<Source> {
    return this._httpClient.post<any>(`${this.getBasePath()}/api/secure/source`, source)
      .pipe(
        map((response: ResponseWrapper) => {
          console.log("SOURCE RESPONSE", response)
          return response.data as Source
        })
      );
  }

  getSources(): Observable<Source[]> {
    return this._httpClient.get<any>(`${this.getBasePath()}/api/secure/source`)
      .pipe(
        map((response: ResponseWrapper) => {
          console.log("SOURCE RESPONSE", response)
          return response.data as Source[]
        })
      );
  }

  getResources(resourceType: string, resourceId?: string ): Observable<ResourceFhir[]> {
    return this._httpClient.get<any>(`${this.getBasePath()}/api/secure/fhir/${resourceType}/${resourceId ? resourceId : ''}`)
      .pipe(
        map((response: ResponseWrapper) => {
          console.log("RESPONSE", response)
          return response.data as ResourceFhir[]
        })
      );
  }
}
