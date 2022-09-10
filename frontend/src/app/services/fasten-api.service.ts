import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ProviderConfig} from '../models/passport/provider-config';
import {environment} from '../../environments/environment';
import {map} from 'rxjs/operators';
import {ResponseWrapper} from '../models/response-wrapper';
import {Source} from '../models/fasten/source';

@Injectable({
  providedIn: 'root'
})
export class FastenApiService {

  constructor(private _httpClient: HttpClient) {
  }

  getBasePath(): string {
    return window.location.pathname.split('/web').slice(0, 1)[0];
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
