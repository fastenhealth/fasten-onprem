import {Inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of, throwError, bindCallback} from 'rxjs';
import {environment} from '../../environments/environment';
import {concatMap, delay, retryWhen, timeout, first, map, filter, catchError, tap} from 'rxjs/operators';
import {ResponseWrapper} from '../models/response-wrapper';
import {LighthouseSourceMetadata} from '../models/lighthouse/lighthouse-source-metadata';
import * as Oauth from '@panva/oauth4webapi';
import {SourceState} from '../models/fasten/source-state';
import {uuidV4} from '../../lib/utils/uuid';
import {LighthouseSourceSearch} from '../models/lighthouse/lighthouse-source-search';
import {HTTP_CLIENT_TOKEN} from "../dependency-injection";
import {MedicalSourcesFilter} from './medical-sources-filter.service';
import {OpenExternalLink} from '../../lib/utils/external_link';
import {Router, UrlSerializer} from '@angular/router';
import {Location} from '@angular/common';
import {PatientAccessBrand, PatientAccessEndpoint, PatientAccessPortal} from '../models/patient-access-brands';
import {GetEndpointAbsolutePath} from '../../lib/utils/endpoint_absolute_path';

export const sourceConnectDesktopTimeout = 24*5000 //wait 2 minutes (5 * 24 = 120)

@Injectable({
  providedIn: 'root'
})
export class LighthouseService {

  constructor(
    @Inject(HTTP_CLIENT_TOKEN) private _httpClient: HttpClient,
    private router: Router,
    private urlSerializer: UrlSerializer,
    private location: Location,
  ) {}

  public storeSourceState(state: string, sourceStateInfo: SourceState) {
    localStorage.setItem(state, JSON.stringify(sourceStateInfo))
  }

  public getSourceState(state: string): SourceState {
    return JSON.parse(localStorage.getItem(state))
  }

  public searchLighthouseSources(filter: MedicalSourcesFilter): Observable<LighthouseSourceSearch> {
    if((typeof filter.searchAfter === 'string' || filter.searchAfter instanceof String) && (filter.searchAfter as string).length > 0){
      filter.searchAfter = (filter.searchAfter as string).split(',')
    } else {
      filter.searchAfter = []
    }
    if(environment.environment_desktop){
      filter.app = "fastenhealth.desktop"
    }

    const endpointUrl = new URL(`${environment.lighthouse_api_endpoint_base}/search`);
    return this._httpClient.post<ResponseWrapper>(endpointUrl.toString(), filter)
      .pipe(
        map((response: ResponseWrapper) => {
          console.log("Metadata RESPONSE", response)
          return response.data as LighthouseSourceSearch
        })
      );
  }

  async getLighthouseSource(endpointId: string): Promise<LighthouseSourceMetadata> {
    return this._httpClient.get<any>(`${environment.lighthouse_api_endpoint_base}/connect/${endpointId}`)
      .pipe(
        map((response: ResponseWrapper) => {
          return response.data as LighthouseSourceMetadata
        })
      ).toPromise();
  }

  async getLighthouseCatalogBrand(brandIdOrPlatformType: string): Promise<PatientAccessBrand> {
    if(brandIdOrPlatformType === 'fasten'){
      return of({
        id: 'fasten',
        last_updated: '',
        portal_ids: [],
        name: '',
        platform_type: 'fasten'
      }).toPromise()
    } else if (brandIdOrPlatformType === 'manual'){
      return of({
        id: 'manual',
        last_updated: '',
        portal_ids: [],
        name: '',
        platform_type: 'manual'
      }).toPromise()
    }

    const catalogUrl = new URL(`${environment.lighthouse_api_endpoint_base}/catalog`);
    catalogUrl.searchParams.set('brand_id', brandIdOrPlatformType);
    return this._httpClient.get<any>(catalogUrl.toString())
      .pipe(
        map((response: ResponseWrapper) => {
          return response.data as PatientAccessBrand
        })
      ).toPromise();
  }

  async getLighthouseCatalogPortal(portalId: string): Promise<PatientAccessPortal> {
    const catalogUrl = new URL(`${environment.lighthouse_api_endpoint_base}/catalog`);
    catalogUrl.searchParams.set('portal_id', portalId);
    return this._httpClient.get<any>(catalogUrl.toString())
      .pipe(
        map((response: ResponseWrapper) => {
          return response.data as PatientAccessPortal
        })
      ).toPromise();
  }

  async getLighthouseCatalogEndpoint(endpointId: string): Promise<PatientAccessEndpoint> {
    const catalogUrl = new URL(`${environment.lighthouse_api_endpoint_base}/catalog`);
    catalogUrl.searchParams.set('endpoint_id', endpointId);
    return this._httpClient.get<any>(catalogUrl.toString())
      .pipe(
        map((response: ResponseWrapper) => {
          return response.data as PatientAccessEndpoint
        })
      ).toPromise();
  }


  async generateSourceAuthorizeUrl(lighthouseSource: LighthouseSourceMetadata, reconnectSourceId?: string): Promise<URL> {
    const state = uuidV4()
    let sourceStateInfo = new SourceState()
    sourceStateInfo.state = state
    sourceStateInfo.endpoint_id = lighthouseSource.id
    sourceStateInfo.portal_id = lighthouseSource.portal_id
    sourceStateInfo.brand_id = lighthouseSource.brand_id
    if(reconnectSourceId){
      //if the source already exists, and we want to re-connect it (because of an expiration), we need to pass the existing source id
      sourceStateInfo.reconnect_source_id = reconnectSourceId
    }

    // generate the authorization url
    const authorizationUrl = new URL(lighthouseSource.authorization_endpoint);
    authorizationUrl.searchParams.set('redirect_uri', lighthouseSource.redirect_uri);
    authorizationUrl.searchParams.set('response_type', lighthouseSource.response_types_supported[0]);
    authorizationUrl.searchParams.set('response_mode', lighthouseSource.response_modes_supported[0]);
    authorizationUrl.searchParams.set('state', state);
    authorizationUrl.searchParams.set('client_id', lighthouseSource.client_id);
    if(lighthouseSource.scopes_supported && lighthouseSource.scopes_supported.length){
      authorizationUrl.searchParams.set('scope', lighthouseSource.scopes_supported.join(' '));
    } else {
      authorizationUrl.searchParams.set('scope', '');
    }
    if (lighthouseSource.aud) {
      authorizationUrl.searchParams.set('aud', lighthouseSource.aud);
    }

    //this is for providers that support CORS and PKCE (public client auth)
    if(!lighthouseSource.confidential || (lighthouseSource.code_challenge_methods_supported || []).length > 0){
      // https://github.com/panva/oauth4webapi/blob/8eba19eac408bdec5c1fe8abac2710c50bfadcc3/examples/public.ts
      const codeVerifier = Oauth.generateRandomCodeVerifier();
      const codeChallenge = await Oauth.calculatePKCECodeChallenge(codeVerifier);
      const codeChallengeMethod = lighthouseSource.code_challenge_methods_supported?.[0] || 'S256'

      sourceStateInfo.code_verifier = codeVerifier
      sourceStateInfo.code_challenge = codeChallenge
      sourceStateInfo.code_challenge_method = codeChallengeMethod

      authorizationUrl.searchParams.set('code_challenge', codeChallenge);
      authorizationUrl.searchParams.set('code_challenge_method', codeChallengeMethod);
    }

    //store the source state info
    this.storeSourceState(state, sourceStateInfo)

    return authorizationUrl
  }

  /**
   * once the user is redirected back to the lighthouse server, we need to get them back to the Fasten server
   * which may not be publically accessible (localhost:8080, 127.0.0.1:8080, 10.0.1.1:8080, etc)
   * to handle this, we "register" an origin_url, which will be used by the lighthouse when the callback url is visited
   * we'll also set a dest_url parameter, which the lighthouse /redirect url will forward the user to once the registration is complete.
   *
   * note: some sources (such as anthem & epic) share a callback url on the provider side (multiple "providers" redirect back to the
   * same callback url -- lighthouse.fastenhealth.com/sandbox/epic).
   *
   * Scenario 1: No reuse of callback url
   * origin_url - localhost:8080/sources/callback/aetna
   * dest_url -  https://.aetna.com/.../oauth2/authorize?redirect_uri=https://lighthouse.fastenhealth.com/callback/aetna
   * redirect_url - lighthouse.fastenhealth.com/sandbox/redirect/{STATE}?origin_url=...&dest_url=...
   *
   * Scenario 2: Reused callback url
   * origin_url - localhost:8080/sources/callback/healthybluela
   * dest_url -  https://patient360la.anthem.com/.../connect/authorize?redirect_uri=https://lighthouse.fastenhealth.com/callback/anthem
   * redirect_url - lighthouse.fastenhealth.com/sandbox/redirect/{STATE}?origin_url=...&dest_url=...
   */
  redirectWithOriginAndDestination(destUrl: string, redirectOpts: {platform_type: string, redirect_uri: string, brand_id: string, portal_id: string, id: string}): Observable<{ codeData:any, state:string }> {
    const originUrlParts = new URL(window.location.href)

    //retrieve the state info from destUrl
    const destUrlParts = new URL(destUrl)
    const state = destUrlParts.searchParams.get("state")

    if(!state){
      throw new Error("No state found in destination url")
      return
    }

    if(environment.environment_desktop){
      //hash based routing
      originUrlParts.hash = `desktop/callback/${state}`
    } else {
      //path based routing
      originUrlParts.hash = "" //reset hash in-case its present.
      originUrlParts.pathname = this.pathJoin([originUrlParts.pathname, `callback/${state}`])
    }

    let redirectUrl = this.pathJoin([environment.lighthouse_api_endpoint_base, `redirect/${state}`])

    const redirectUrlParts = new URL(redirectUrl);
    const redirectParams = new URLSearchParams()
    redirectParams.set("origin_url", originUrlParts.toString())
    redirectParams.set("dest_url", destUrl)
    redirectParams.set("desktop_mode", environment.environment_desktop ? "true" : "false")
    redirectParams.set("brand_id", redirectOpts.brand_id)
    redirectParams.set("portal_id", redirectOpts.portal_id)
    redirectParams.set("endpoint_id", redirectOpts.id)
    redirectUrlParts.search = redirectParams.toString()
    console.log(redirectUrlParts.toString());


    //if we're in desktop mode, we can open a new window, rather than redirecting the current window (which is an app frame)
    if(environment.environment_desktop && environment.popup_source_auth){
      //@ts-ignore

      OpenExternalLink(redirectUrlParts.toString(), environment.environment_desktop, state)

      return this.waitForDesktopCodeOrTimeout(state)

      //now wait for response from the opened window
    } else {
      //redirect to the url in the same window
      window.location.href = redirectUrlParts.toString();
      return of(null) //should never happen
    }

  }

  async swapOauthToken(sourceMetadata: LighthouseSourceMetadata, expectedSourceStateInfo: SourceState, code: string): Promise<any>{
    // @ts-expect-error
    const client: oauth.Client = {
      client_id: sourceMetadata.client_id
    }
    //this is for providers that support CORS & PKCE (public client auth)
    let codeVerifier = undefined

    let tokenEndpointUrl = sourceMetadata.token_endpoint

    if(sourceMetadata.confidential) {
      console.log("This is a confidential client, using lighthouse token endpoint.")
      //if this is a confidential client, we need to "override" token endpoint, and use the Fasten Lighthouse to complete the swap
      tokenEndpointUrl = this.pathJoin([environment.lighthouse_api_endpoint_base, `token/${expectedSourceStateInfo.endpoint_id}`])

      //use a placeholder client_secret (the actual secret is stored in Lighthouse)
      client.client_secret = "placeholder"
      client.token_endpoint_auth_method = "client_secret_basic"
      if((sourceMetadata.code_challenge_methods_supported || []).length > 0){
        codeVerifier = expectedSourceStateInfo.code_verifier
      } else {
        codeVerifier = "placeholder"
      }
    }  else {
      //is not confidential
      client.token_endpoint_auth_method = 'none'
      codeVerifier = expectedSourceStateInfo.code_verifier

      //check if source requires a CORS relay
      if(sourceMetadata.cors_relay_required){
        let corsProxyBaseUrl = `${GetEndpointAbsolutePath(globalThis.location, environment.fasten_api_endpoint_base)}/cors/${sourceMetadata.id}/`

        //this endpoint requires a CORS relay
        //get the path to the Fasten server, and append `cors/` and then append the request url
        let tokenEndpointUrlParts = new URL(tokenEndpointUrl)
        tokenEndpointUrl = corsProxyBaseUrl + `${tokenEndpointUrlParts.hostname}${tokenEndpointUrlParts.pathname}${tokenEndpointUrlParts.search}`
        console.warn("Using local CORS proxy for token endpoint", tokenEndpointUrl)
      }

    }

    const as = {
      issuer: sourceMetadata.issuer,
      authorization_endpoint:	sourceMetadata.authorization_endpoint,
      token_endpoint:	tokenEndpointUrl,
      introspection_endpoint: sourceMetadata.introspection_endpoint,
    }

    console.log("STARTING--- Oauth.validateAuthResponse", as)
    const params = Oauth.validateAuthResponse(as, client, new URLSearchParams({"code": code, "state": expectedSourceStateInfo.state}), expectedSourceStateInfo.state)
    if (Oauth.isOAuth2Error(params)) {
      console.log('error', params)
      throw new Error('error when validating code & state before token exchange') // Handle OAuth 2.0 redirect error
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

  private waitForDesktopCodeOrTimeout(state: string): Observable<{ codeData:any, state:string }> {
    console.log(`waiting for wails Event notification from window`)

    if(typeof wails == "undefined"){
      return throwError("wails is not defined, this is likely because you're running in a browser.")
    }

    let fromWailsEvent = bindCallback(wails.Events.Once)

    //new code to listen to post message
    return fromWailsEvent('wails:fasten-lighthouse:response')
      .pipe(
        //throw an error if we wait more than 2 minutes (this will close the window)
        timeout(sourceConnectDesktopTimeout),
        //make sure we're only listening to events from the "opened" window.
        filter((eventPayload: any ) => eventPayload.sender == state),
        //after filtering, we should only have one event to handle.
        first(),
        map((event) => {
          console.log(`received wails event notification from ${state} window & sending acknowledgment`, event)
          // @ts-ignore
          return {
            state: state,
            codeData: event.data
          }
        }),
        catchError((err) => {
          console.warn(`timed out waiting for notification from ${state} (${sourceConnectDesktopTimeout/1000}s), closing window`)
          wails.Application.GetWindowByName(state).Window.Close()
          return throwError(err)
        })
  )
  }

  //after waiting for the desktop code, we need to redirect to the callback page with the code in the query params
  // (which is what would have happened if we were in a browser and we were redirected as usual)
  redirectWithDesktopCode(state: string, codeData: any){

    if(!codeData){
      //if we redirected completely, no callback data will be present.
      return
    }

    //User was shown a popup, which was closed, and data was returned using events
    //redirect to callback page with code

    let urlTree = this.router.createUrlTree(
      ['/sources/callback/' + state],
      { queryParams: codeData, }
    );

    let absUrl = this.location.prepareExternalUrl(this.urlSerializer.serialize(urlTree))
    console.log(absUrl);
    window.location.replace(absUrl)

  }

}

