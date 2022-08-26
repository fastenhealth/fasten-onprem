import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ProviderConfig} from '../models/passport/provider-config';
import {environment} from '../../environments/environment';
import {map} from 'rxjs/operators';
import {ResponseWrapper} from '../models/response-wrapper';
import {ProviderCredential} from '../models/fasten/provider-credential';

@Injectable({
  providedIn: 'root'
})
export class FastenApiService {

  constructor(private _httpClient: HttpClient) {
  }

  getBasePath(): string {
    return window.location.pathname.split('/web').slice(0, 1)[0];
  }

  createProviderCredential(providerCredential: ProviderCredential): Observable<ProviderCredential> {
    return this._httpClient.post<any>(`${this.getBasePath()}/api/provider_credential`, providerCredential)
      .pipe(
        map((response: ResponseWrapper) => {
          console.log("PROVIDER CREDENTIAL RESPONSE", response)
          return response.data as ProviderCredential
        })
      );
  }
}
