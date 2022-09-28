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
import {SourceSummary} from '../models/fasten/source-summary';
import {Summary} from '../models/fasten/summary';
import {MetadataSource} from '../models/fasten/metadata-source';

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
        if(res.success){
          localStorage.setItem(this.AUTH_TOKEN_KEY, res.data);
          return res.data
        } else {
          throw new Error(res.error)
        }

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
        if(res.success){
          localStorage.setItem(this.AUTH_TOKEN_KEY, res.data);
          return res.data
        } else {
          throw new Error(res.error)
        }
      }
    ));
  }


  /*
  SECURE ENDPOINTS
  */
  getSummary(): Observable<Summary> {
    return this._httpClient.get<any>(`${this.getBasePath()}/api/secure/summary`, )
      .pipe(
        map((response: ResponseWrapper) => {
          console.log("Summary RESPONSE", response)
          return response.data as Summary
        })
      );
  }

  createSource(source: Source): Observable<Source> {
    return this._httpClient.post<any>(`${this.getBasePath()}/api/secure/source`, source)
      .pipe(
        map((response: ResponseWrapper) => {
          console.log("SOURCE RESPONSE", response)
          return response.data as Source
        })
      );
  }

  createManualSource(file: File): Observable<Source> {

    const formData = new FormData();
    formData.append('file', file);

    return this._httpClient.post<any>(`${this.getBasePath()}/api/secure/source/manual`, formData)
      .pipe(
        map((response: ResponseWrapper) => {
          console.log("MANUAL SOURCE RESPONSE", response)
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

  getSource(sourceId: string): Observable<Source> {
    return this._httpClient.get<any>(`${this.getBasePath()}/api/secure/source/${sourceId}`)
      .pipe(
        map((response: ResponseWrapper) => {
          console.log("SOURCE RESPONSE", response)
          return response.data as Source
        })
      );
  }

  getSourceSummary(sourceId: string): Observable<SourceSummary> {
    return this._httpClient.get<any>(`${this.getBasePath()}/api/secure/source/${sourceId}/summary`)
      .pipe(
        map((response: ResponseWrapper) => {
          console.log("SOURCE RESPONSE", response)
          return response.data as SourceSummary
        })
      );
  }

  syncSource(sourceId: string): Observable<any> {
    return this._httpClient.post<any>(`${this.getBasePath()}/api/secure/source/${sourceId}/sync`, {})
      .pipe(
        map((response: ResponseWrapper) => {
          console.log("SOURCE RESPONSE", response)
          return response.data
        })
      );
  }

  getResources(sourceResourceType?: string, sourceID?: string): Observable<ResourceFhir[]> {
    let queryParams = {}
    if(sourceResourceType){
      queryParams["sourceResourceType"] = sourceResourceType
    }
    if(sourceID){
      queryParams["sourceID"] = sourceID
    }

    return this._httpClient.get<any>(`${this.getBasePath()}/api/secure/resource/fhir`, {params: queryParams})
      .pipe(
        map((response: ResponseWrapper) => {
          console.log("RESPONSE", response)
          return response.data as ResourceFhir[]
        })
      );
  }

  getResourceBySourceId(sourceId: string, resourceId: string): Observable<ResourceFhir> {

    return this._httpClient.get<any>(`${this.getBasePath()}/api/secure/resource/fhir/${sourceId}/${resourceId}`)
      .pipe(
        map((response: ResponseWrapper) => {
          console.log("RESPONSE", response)
          return response.data as ResourceFhir
        })
      );
  }

  getMetadataSources(): Observable<{[name: string]: MetadataSource}> {
    return this._httpClient.get<any>(`${this.getBasePath()}/api/metadata/source`)
      .pipe(
        map((response: ResponseWrapper) => {
          console.log("Metadata RESPONSE", response)
          return response.data as {[name: string]: MetadataSource}
        })
      );
  }
}
