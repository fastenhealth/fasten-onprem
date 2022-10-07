import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {map, tap} from 'rxjs/operators';
import {ResponseWrapper} from '../models/response-wrapper';
import {LighthouseSourceMetadata} from '../../lib/models/lighthouse/lighthouse-source-metadata';
import * as Oauth from '@panva/oauth4webapi';

@Injectable({
  providedIn: 'root'
})
export class LighthouseService {

  constructor(private _httpClient: HttpClient) {
  }

  async getLighthouseSource(sourceType: string): Promise<LighthouseSourceMetadata> {
    return this._httpClient.get<any>(`${environment.lighthouse_api_endpoint_base}/connect/${sourceType}`)
      .pipe(
        map((response: ResponseWrapper) => {
          return response.data as LighthouseSourceMetadata
        })
      ).toPromise();
  }


  async generateSourceAuthorizeUrl(sourceType: string, lighthouseSource: LighthouseSourceMetadata): Promise<URL> {
    const state = this.uuidV4()
    localStorage.setItem(`${sourceType}:state`, state)

    // generate the authorization url
    const authorizationUrl = new URL(lighthouseSource.authorization_endpoint);
    authorizationUrl.searchParams.set('redirect_uri', lighthouseSource.redirect_uri);
    authorizationUrl.searchParams.set('response_type', lighthouseSource.response_types_supported[0]);
    authorizationUrl.searchParams.set('response_mode', 'fragment');
    authorizationUrl.searchParams.set('state', state);
    authorizationUrl.searchParams.set('client_id', lighthouseSource.client_id);
    if(lighthouseSource.scopes_supported && lighthouseSource.scopes_supported.length){
      authorizationUrl.searchParams.set('scope', lighthouseSource.scopes_supported.join(' '));
    }
    if (lighthouseSource.aud) {
      authorizationUrl.searchParams.set('aud', lighthouseSource.aud);
    }

    //this is for providers that support CORS and PKCE (public client auth)
    if(!lighthouseSource.confidential){
      // https://github.com/panva/oauth4webapi/blob/8eba19eac408bdec5c1fe8abac2710c50bfadcc3/examples/public.ts
      const codeVerifier = Oauth.generateRandomCodeVerifier();
      const codeChallenge = await Oauth.calculatePKCECodeChallenge(codeVerifier);
      const codeChallengeMethod = lighthouseSource.code_challenge_methods_supported[0]; // 'S256'

      localStorage.setItem(`${sourceType}:code_verifier`, codeVerifier)
      localStorage.setItem(`${sourceType}:code_challenge`, codeChallenge)
      localStorage.setItem(`${sourceType}:code_challenge_method`, codeChallengeMethod)

      authorizationUrl.searchParams.set('code_challenge', codeChallenge);
      authorizationUrl.searchParams.set('code_challenge_method', codeChallengeMethod);
    }

    return authorizationUrl
  }

  redirectWithOriginAndDestination(destUrl: string, sourceType: string): void {
    const originUrlParts = new URL(window.location.href)
    originUrlParts.hash = "" //reset hash in-case its present.
    originUrlParts.pathname = this.pathJoin([originUrlParts.pathname, `callback/${sourceType}`])


    const redirectUrlParts = new URL(`${environment.lighthouse_api_endpoint_base}/redirect/${sourceType}`);
    const redirectParams = new URLSearchParams()
    redirectParams.set("origin_url", originUrlParts.toString())
    redirectParams.set("dest_url", destUrl)
    redirectUrlParts.search = redirectParams.toString()
    console.log(redirectUrlParts.toString());

    // Simulate a mouse click:
    window.location.href = redirectUrlParts.toString();
  }

  async swapOauthToken(sourceType: string, sourceMetadata: LighthouseSourceMetadata, expectedState: string, state: string, code: string): Promise<any>{
    // @ts-expect-error
    const client: oauth.Client = {
      client_id: sourceMetadata.client_id
    }
    //this is for providers that support CORS & PKCE (public client auth)
    let codeVerifier = undefined
    if(!sourceMetadata.confidential){
      client.token_endpoint_auth_method = 'none'
      codeVerifier = localStorage.getItem(`${sourceType}:code_verifier`)

      localStorage.removeItem(`${sourceType}:code_verifier`)
      localStorage.removeItem(`${sourceType}:code_challenge`)
      localStorage.removeItem(`${sourceType}:code_challenge_method`)
    } else {
      console.log("This is a confidential client, using lighthouse token endpoint.")
      //if this is a confidential client, we need to "override" token endpoint, and use the Fasten Lighthouse to complete the swap
      sourceMetadata.token_endpoint = sourceMetadata.redirect_uri.replace("callback", "token")
      //use a placeholder client_secret (the actual secret is stored in Lighthouse)
      client.client_secret = "placeholder"
      client.token_endpoint_auth_method = "client_secret_basic"
      codeVerifier = "placeholder"
    }

    const as = {
      issuer: sourceMetadata.issuer,
      authorization_endpoint:	sourceMetadata.authorization_endpoint,
      token_endpoint:	sourceMetadata.token_endpoint,
      introspection_endpoint: sourceMetadata.introspection_endpoint,
    }

    console.log("STARTING--- Oauth.validateAuthResponse")
    const params = Oauth.validateAuthResponse(as, client, new URLSearchParams({"code": code, "state": state}), expectedState)
    if (Oauth.isOAuth2Error(params)) {
      console.log('error', params)
      throw new Error() // Handle OAuth 2.0 redirect error
    }
    console.log("ENDING--- Oauth.validateAuthResponse")
    console.log("STARTING--- Oauth.authorizationCodeGrantRequest")
    const response = await Oauth.authorizationCodeGrantRequest(
      as,
      client,
      params,
      sourceMetadata.redirect_uri,
      codeVerifier,
    )
    let payload = await response.json()
    console.log("ENDING--- Oauth.authorizationCodeGrantRequest", payload)
    return payload
  }



  private pathJoin(parts: string[], sep?: string): string{
    const separator = sep || '/';
    parts = parts.map((part, index)=>{
      if (index) {
        part = part.replace(new RegExp('^' + separator), '');
      }
      if (index !== parts.length - 1) {
        part = part.replace(new RegExp(separator + '$'), '');
      }
      return part;
    })
    return parts.join(separator);
  }

  private uuidV4(){
    // @ts-ignore
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }
}
