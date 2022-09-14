import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {map, tap} from 'rxjs/operators';
import {ResponseWrapper} from '../models/response-wrapper';
import {ProviderConfig} from '../models/passport/provider-config';
import {AuthorizeClaim} from '../models/passport/authorize-claim';

@Injectable({
  providedIn: 'root'
})
export class LighthouseService {

  constructor(private _httpClient: HttpClient) {
  }

  getProviderConfig(providerId: string): Observable<ProviderConfig> {
    return this._httpClient.get<any>(`${environment.lighthouse_api_endpoint_base}/connect/${providerId}`)
      .pipe(
        map((response: ResponseWrapper) => {
          return response.data as ProviderConfig
        })
      );
  }

  generatePKCEProviderAuthorizeUrl(codeVerifier: string, codeChallenge: string, codeChallengeMethod: string, state: string, providerConfig: ProviderConfig): URL {
    // generate the authorization url
    const authorizationUrl = new URL(`${providerConfig.oauth_endpoint_base_url}/authorize`);
    authorizationUrl.searchParams.set('client_id', providerConfig.client_id);
    authorizationUrl.searchParams.set('code_challenge', codeChallenge);
    authorizationUrl.searchParams.set('code_challenge_method', codeChallengeMethod);
    authorizationUrl.searchParams.set('redirect_uri', providerConfig.redirect_uri);
    authorizationUrl.searchParams.set('response_type', 'code');
    authorizationUrl.searchParams.set('scope', providerConfig.scopes.join(' '));
    authorizationUrl.searchParams.set('state', state);
    if (providerConfig.aud) {
      authorizationUrl.searchParams.set('aud', providerConfig.aud);
    }
    return authorizationUrl
  }

  getProviderAuthorizeClaim(providerId: string, state: string): Observable<AuthorizeClaim> {
    return this._httpClient.get<any>(`${environment.lighthouse_api_endpoint_base}/claim/${providerId}`, {params: {"state": state}})
      .pipe(
        map((response: ResponseWrapper) => {
          return response.data as AuthorizeClaim
        })
      );
  }

}
