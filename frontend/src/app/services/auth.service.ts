import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {User} from '../models/fasten/user';
import {environment} from '../../environments/environment';
import {GetEndpointAbsolutePath} from '../../lib/utils/endpoint_absolute_path';
import {ResponseWrapper} from '../models/response-wrapper';
import * as Oauth from '@panva/oauth4webapi';
import {SourceState} from '../models/fasten/source-state';
import * as jose from 'jose';
import {UserRegisteredClaims} from '../models/fasten/user-registered-claims';
import {uuidV4} from '../../lib/utils/uuid';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  FASTEN_JWT_LOCALSTORAGE_KEY = 'token';

  constructor(private _httpClient: HttpClient) {
  }

  //Third-party JWT auth, used by Fasten Cloud
  public async IdpConnect(idp_type: string) {

    const state = uuidV4()
    let sourceStateInfo = new SourceState()
    sourceStateInfo.state = state
    sourceStateInfo.source_type = idp_type
    sourceStateInfo.redirect_uri = `${window.location.href}/callback/hello`

    // generate the authorization url
    const authorizationUrl = new URL("https://wallet.hello.coop/authorize");
    authorizationUrl.searchParams.set('redirect_uri',  sourceStateInfo.redirect_uri);
    authorizationUrl.searchParams.set('response_type', "code");
    authorizationUrl.searchParams.set('response_mode', 'fragment');
    authorizationUrl.searchParams.set('state', state);
    authorizationUrl.searchParams.set('client_id', 'f5d8284d-c205-4d06-9fa4-c9fd809f30fc');
    authorizationUrl.searchParams.set('scope', 'name email openid');

    const codeVerifier = Oauth.generateRandomCodeVerifier();
    const codeChallenge = await Oauth.calculatePKCECodeChallenge(codeVerifier);
    const codeChallengeMethod = 'S256'

    sourceStateInfo.code_verifier = codeVerifier
    sourceStateInfo.code_challenge = codeChallenge
    sourceStateInfo.code_challenge_method = codeChallengeMethod

    authorizationUrl.searchParams.set('code_challenge', codeChallenge);
    authorizationUrl.searchParams.set('code_challenge_method', codeChallengeMethod);

    localStorage.setItem(state, JSON.stringify(sourceStateInfo))

    window.location.href = authorizationUrl.toString();
  }

  public async IdpCallback(idp_type: string, state: string, code: string): Promise<string> {

    const expectedSourceStateInfo = JSON.parse(localStorage.getItem(state))
    localStorage.removeItem(state)

    // @ts-expect-error
    const client: oauth.Client = {
      client_id: 'f5d8284d-c205-4d06-9fa4-c9fd809f30fc',
      token_endpoint_auth_method: 'none'
    }
    let codeVerifier = expectedSourceStateInfo.code_verifier

    const as = {
      issuer: "https://issuer.hello.coop",
      authorization_endpoint:	"https://wallet.hello.coop/authorize",
      token_endpoint:	"https://wallet.hello.coop/oauth/token",
      introspection_endpoint: "https://wallet.hello.coop/oauth/introspect"
    }

    console.log("STARTING--- Oauth.validateAuthResponse")
    const params = Oauth.validateAuthResponse(as, client, new URLSearchParams({"code": code, "state": expectedSourceStateInfo.state}), expectedSourceStateInfo.state)
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
      expectedSourceStateInfo.redirect_uri,
      codeVerifier,
    )
    let payload = await response.json()
    console.log("ENDING--- Oauth.authorizationCodeGrantRequest", payload)


    //trade Hello Idtoken for Fasten DB token.
    let fastenApiEndpointBase = GetEndpointAbsolutePath(globalThis.location,environment.fasten_api_endpoint_base)
    let resp = await this._httpClient.post<ResponseWrapper>(`${fastenApiEndpointBase}/auth/callback/${idp_type}`, payload).toPromise()

    this.setAuthToken(resp.data)

    return resp.data
  }


  //Primary auth used by self-hosted Fasten
  /**
   * Signup  (and Signin) both require an "online" user.
   * @param newUser
   * @constructor
   */
  public async Signup(newUser?: User): Promise<any> {
    let fastenApiEndpointBase = GetEndpointAbsolutePath(globalThis.location, environment.fasten_api_endpoint_base)
    let resp = await this._httpClient.post<ResponseWrapper>(`${fastenApiEndpointBase}/auth/signup`, newUser).toPromise()
    console.log(resp)

    this.setAuthToken(resp.data)

  }

  public async Signin(username: string, pass: string): Promise<any> {
    let currentUser = new User()
    currentUser.username = username
    currentUser.password = pass

    let fastenApiEndpointBase = GetEndpointAbsolutePath(globalThis.location, environment.fasten_api_endpoint_base)
    let resp = await this._httpClient.post<ResponseWrapper>(`${fastenApiEndpointBase}/auth/signin`, currentUser).toPromise()

    this.setAuthToken(resp.data)
  }


  //TODO: now that we've moved to remote-first database, we can refactor and simplify this function significantly.
  public async IsAuthenticated(): Promise<boolean> {
    let authToken = this.GetAuthToken()
    let hasAuthToken = !!authToken
    if(!hasAuthToken){
      return false
    }

    //todo: check if the authToken has expired
    return true

    // //check if the authToken has expired.
    // let databaseEndpointBase = GetEndpointAbsolutePath(globalThis.location, environment.couchdb_endpoint_base)
    // try {
    //   let resp = await this._httpClient.get<any>(`${databaseEndpointBase}/_session`, {
    //     headers: new HttpHeaders({
    //       'Content-Type':  'application/json',
    //       Authorization: `Bearer ${authToken}`
    //     })
    //   }).toPromise()
    //   //  logic to check if user is logged in here.
    //   let session = resp as Session
    //   if(!session.ok || session?.info?.authenticated != "jwt" || !session.userCtx?.name){
    //     //invalid session, not jwt auth, or username is empty
    //     return false
    //   }
    //   return true
    // } catch (e) {
    //   return false
    // }
  }

  public GetAuthToken(): string {
    return localStorage.getItem(this.FASTEN_JWT_LOCALSTORAGE_KEY);
  }

  public GetCurrentUser(): UserRegisteredClaims {
    let authToken = this.GetAuthToken()
    if(!authToken){
      throw new Error("no auth token found")
    }

    //parse the authToken to get user information
    let jwtClaims = jose.decodeJwt(authToken)

    // @ts-ignore
    return jwtClaims as UserRegisteredClaims
  }

  public async Logout(): Promise<any> {
    return localStorage.removeItem(this.FASTEN_JWT_LOCALSTORAGE_KEY)
    // // let remotePouchDb = new PouchDB(this.getRemoteUserDb(localStorage.getItem("current_user")), {skip_setup: true});
    // if(this.pouchDb){
    //   await this.pouchDb.logOut()
    // }
    // await this.Close()
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////
  //Private Methods
  /////////////////////////////////////////////////////////////////////////////////////////////////

  private setAuthToken(token: string) {
    localStorage.setItem(this.FASTEN_JWT_LOCALSTORAGE_KEY, token)
  }
}
