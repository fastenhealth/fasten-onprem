import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {ResponseWrapper} from '../models/response-wrapper';
import {MetadataSource} from '../models/fasten/metadata-source';

@Injectable({
  providedIn: 'root'
})
export class FastenApiService {

  constructor(private _httpClient: HttpClient) {
  }

  private getBasePath(): string {
    return window.location.pathname.split('/web').slice(0, 1)[0];
  }

  public GetMetadataSources(): Observable<{[name: string]: MetadataSource}> {
    return this._httpClient.get<ResponseWrapper>(`${this.getBasePath()}/api/metadata/source`)
      .pipe(
        map((response: ResponseWrapper) => {
          console.log("Metadata RESPONSE", response)
          return response.data as {[name: string]: MetadataSource}
        })
      );
  }
}
