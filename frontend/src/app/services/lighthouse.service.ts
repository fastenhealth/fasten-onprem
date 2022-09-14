import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {map, tap} from 'rxjs/operators';
import {ResponseWrapper} from '../models/response-wrapper';
import {LighthouseSource} from '../models/lighthouse/lighthouse-source';
import {AuthorizeClaim} from '../models/lighthouse/authorize-claim';

@Injectable({
  providedIn: 'root'
})
export class LighthouseService {

  constructor(private _httpClient: HttpClient) {
  }

  getLighthouseSource(sourceType: string): Observable<LighthouseSource> {
    return this._httpClient.get<any>(`${environment.lighthouse_api_endpoint_base}/connect/${sourceType}`)
      .pipe(
        map((response: ResponseWrapper) => {
          return response.data as LighthouseSource
        })
      );
  }

  generatePKCESourceAuthorizeUrl(codeVerifier: string, codeChallenge: string, codeChallengeMethod: string, state: string, lighthouseSource: LighthouseSource): URL {
    // generate the authorization url
    const authorizationUrl = new URL(`${lighthouseSource.oauth_endpoint_base_url}/authorize`);
    authorizationUrl.searchParams.set('client_id', lighthouseSource.client_id);
    authorizationUrl.searchParams.set('code_challenge', codeChallenge);
    authorizationUrl.searchParams.set('code_challenge_method', codeChallengeMethod);
    authorizationUrl.searchParams.set('redirect_uri', lighthouseSource.redirect_uri);
    authorizationUrl.searchParams.set('response_type', 'code');
    authorizationUrl.searchParams.set('scope', lighthouseSource.scopes.join(' '));
    authorizationUrl.searchParams.set('state', state);
    if (lighthouseSource.aud) {
      authorizationUrl.searchParams.set('aud', lighthouseSource.aud);
    }
    return authorizationUrl
  }

  getSourceAuthorizeClaim(sourceType: string, state: string): Observable<AuthorizeClaim> {
    return this._httpClient.get<any>(`${environment.lighthouse_api_endpoint_base}/claim/${sourceType}`, {params: {"state": state}})
      .pipe(
        map((response: ResponseWrapper) => {
          return response.data as AuthorizeClaim
        })
      );
  }

}
