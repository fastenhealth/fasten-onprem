import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Observable} from 'rxjs';
import { Router } from '@angular/router';
import {map} from 'rxjs/operators';
import {ResponseWrapper} from '../models/response-wrapper';
import {Source} from '../models/fasten/source';
import {User} from '../models/fasten/user';
import {ResourceFhir} from '../models/fasten/resource_fhir';
import {SourceSummary} from '../models/fasten/source-summary';
import {Summary} from '../models/fasten/summary';
import {MetadataSource} from '../models/fasten/metadata-source';
import {AuthService} from './auth.service';
import {GetEndpointAbsolutePath} from '../../lib/utils/endpoint_absolute_path';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FastenApiService {

  constructor(private _httpClient: HttpClient,  private router: Router, private authService: AuthService) {
  }


  /*
  SECURE ENDPOINTS
  */
  getSummary(): Observable<Summary> {
    return this._httpClient.get<any>(`${GetEndpointAbsolutePath(globalThis.location, environment.fasten_api_endpoint_base)}/secure/summary`, )
      .pipe(
        map((response: ResponseWrapper) => {
          console.log("Summary RESPONSE", response)
          return response.data as Summary
        })
      );
  }

  createSource(source: Source): Observable<Source> {
    return this._httpClient.post<any>(`${GetEndpointAbsolutePath(globalThis.location, environment.fasten_api_endpoint_base)}/secure/source`, source)
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

    return this._httpClient.post<any>(`${GetEndpointAbsolutePath(globalThis.location, environment.fasten_api_endpoint_base)}/secure/source/manual`, formData)
      .pipe(
        map((response: ResponseWrapper) => {
          console.log("MANUAL SOURCE RESPONSE", response)
          return response.data as Source
        })
      );
  }

  getSources(): Observable<Source[]> {
    return this._httpClient.get<any>(`${GetEndpointAbsolutePath(globalThis.location, environment.fasten_api_endpoint_base)}/secure/source`)
      .pipe(
        map((response: ResponseWrapper) => {
          console.log("SOURCE RESPONSE", response)
          return response.data as Source[]
        })
      );
  }

  getSource(sourceId: string): Observable<Source> {
    return this._httpClient.get<any>(`${GetEndpointAbsolutePath(globalThis.location, environment.fasten_api_endpoint_base)}/secure/source/${sourceId}`)
      .pipe(
        map((response: ResponseWrapper) => {
          console.log("SOURCE RESPONSE", response)
          return response.data as Source
        })
      );
  }

  getSourceSummary(sourceId: string): Observable<SourceSummary> {
    return this._httpClient.get<any>(`${GetEndpointAbsolutePath(globalThis.location, environment.fasten_api_endpoint_base)}/secure/source/${sourceId}/summary`)
      .pipe(
        map((response: ResponseWrapper) => {
          console.log("SOURCE RESPONSE", response)
          return response.data as SourceSummary
        })
      );
  }

  syncSource(sourceId: string): Observable<any> {
    return this._httpClient.post<any>(`${GetEndpointAbsolutePath(globalThis.location, environment.fasten_api_endpoint_base)}/secure/source/${sourceId}/sync`, {})
      .pipe(
        map((response: ResponseWrapper) => {
          console.log("SOURCE RESPONSE", response)
          return response.data
        })
      );
  }

  getResources(sourceResourceType?: string, sourceID?: string, sourceResourceID?: string, preloadRelated?: boolean): Observable<ResourceFhir[]> {
    let queryParams = {}
    if(sourceResourceType){
      queryParams["sourceResourceType"] = sourceResourceType
    }
    if(sourceID){
      queryParams["sourceID"] = sourceID
    }

    if(sourceResourceID){
      queryParams["sourceResourceID"] = sourceResourceID
    }
    if(preloadRelated){
      queryParams["preloadRelated"] = "true"
    }

    return this._httpClient.get<any>(`${GetEndpointAbsolutePath(globalThis.location, environment.fasten_api_endpoint_base)}/secure/resource/fhir`, {params: queryParams})
      .pipe(
        map((response: ResponseWrapper) => {
          console.log("RESPONSE", response)
          return response.data as ResourceFhir[]
        })
      );
  }

  getResourceBySourceId(sourceId: string, resourceId: string): Observable<ResourceFhir> {

    return this._httpClient.get<any>(`${GetEndpointAbsolutePath(globalThis.location, environment.fasten_api_endpoint_base)}/secure/resource/fhir/${sourceId}/${resourceId}`)
      .pipe(
        map((response: ResponseWrapper) => {
          console.log("RESPONSE", response)
          return response.data as ResourceFhir
        })
      );
  }
}
