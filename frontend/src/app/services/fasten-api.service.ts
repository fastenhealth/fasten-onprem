import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Observable} from 'rxjs';
import { Router } from '@angular/router';
import {ProviderConfig} from '../models/passport/provider-config';
import {environment} from '../../environments/environment';
import {map} from 'rxjs/operators';
import {ResponseWrapper} from '../models/response-wrapper';
import {Source} from '../models/fasten/source';
import {User} from '../models/fasten/user';

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
    this.router.navigateByUrl('/');
  }

  signup(newUser: User): Observable<any> {
    return this._httpClient.post<any>(`${this.getBasePath()}/api/auth/signup`, newUser).pipe(
      map((res: any) => {
        localStorage.setItem(this.AUTH_TOKEN_KEY, res.data);
        return res.data
      }
    ));
  }


  signin(email: string, pass: string) {
    const headers = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' })
    };

    const data = {
      email: email,
      password: pass
    };

    this._httpClient.post<any>(`${this.getBasePath()}/api/auth/signin`, data, headers).subscribe(
      (res: any) => {
        localStorage.setItem(this.AUTH_TOKEN_KEY, res.token);

        this.router.navigateByUrl('/dashboard');
      }
    );
  }


  createSource(source: Source): Observable<Source> {
    return this._httpClient.post<any>(`${this.getBasePath()}/api/source`, source)
      .pipe(
        map((response: ResponseWrapper) => {
          console.log("SOURCE RESPONSE", response)
          return response.data as Source
        })
      );
  }

  getResources(resourceType: string, resourceId?: string ) {
    return this._httpClient.get<any>(`${this.getBasePath()}/api/fhir/${resourceType}/${resourceId ? resourceId : ''}`)
      .pipe(
        map((response: ResponseWrapper) => {
          console.log("RESPONSE", response)
          return response.data
        })
      );
  }
}
