import {Source} from '../../../models/database/source';
import * as Oauth from '@panva/oauth4webapi';
import {IResourceRaw} from '../../interface';
import {GetEndpointAbsolutePath} from '../../../utils/endpoint_absolute_path';
import {ClientConfig} from '../../../models/client/client-config';


class SourceUpdateStatus {
  is_updated: boolean = false
  source: Source
}

// BaseClient is an abstract/partial class, its intended to be used by FHIR clients, and generically handle OAuth requests.
export abstract class BaseClient {

  private clientConfig: ClientConfig
  private oauthClient: Oauth.Client
  private oauthAuthorizationServer: Oauth.AuthorizationServer
  public source: Source
  public headers: Headers


  protected constructor(source: Source, clientConfig: ClientConfig) {
    this.source = source
    this.clientConfig = clientConfig
    this.headers = new Headers()

    //init Oauth client based on source configuration
    this.oauthClient = {
      client_id: source.client_id,
      client_secret: "placeholder" //this is always a placeholder, if client_secret is required (for confidential clients), token_endpoint will be Lighthouse server.
    }
    this.oauthAuthorizationServer = {
      issuer: source.issuer,
      authorization_endpoint:	source.authorization_endpoint,
      token_endpoint:	source.token_endpoint,
      introspection_endpoint: source.introspection_endpoint,
    }
  }

  /**
   * This function gets the FhirVersion as specified by the api CapabilityStatement endpoint (metadata)
   * https://build.fhir.org/capabilitystatement.html
   * @constructor
   */
  public async GetFhirVersion(): Promise<any> {
    return this.GetRequest("metadata")
      .then((resp) => {
        return resp.fhirVersion
      })
  }

  /**
   * This function will make an authenticated request against an OAuth protected resource. If the AccessToken used has expired, it will attempt
   * to use a refresh token (if present) to get a new AccessToken.
   * @param resourceSubpathOrNext
   * @constructor
   */
  public async GetRequest(resourceSubpathOrNext: string): Promise<any> {

    //check if the url is absolute
    let resourceUrl: string
    if (!(resourceSubpathOrNext.indexOf('http://') === 0 || resourceSubpathOrNext.indexOf('https://') === 0)) {
      //not absolute, so lets prefix with the source api endpoint
      resourceUrl = `${this.source.api_endpoint_base_url.trimEnd()}/${resourceSubpathOrNext.trimStart()}`
    } else {
      resourceUrl = resourceSubpathOrNext
    }
    if(this.source.cors_relay_required){
      //this endpoint requires a CORS relay
      //get the path to the Fasten server, and append `cors/` and then append the request url
      let resourceParts = new URL(resourceUrl)
      resourceUrl = GetEndpointAbsolutePath(globalThis.location, this.clientConfig.fasten_api_endpoint_base) + `/${resourceParts.hostname}${resourceParts.pathname}${resourceParts.search}`
    }


    //refresh the source if required
    await this.RefreshSourceToken()

    //make a request to the protected resource
    const resp = await Oauth.protectedResourceRequest(this.source.access_token, 'GET', new URL(resourceUrl), this.headers, null)

    if(resp.status >=300 || resp.status < 200){
      // b, _ := io.ReadAll(resp.Body)
      throw new Error(`An error occurred during request ${resourceUrl} - ${resp.status} - ${resp.statusText} ${await resp.text()}`)
    }
    return resp.json()
    // err = ParseBundle(resp.Body, decodeModelPtr)
    // return err
  }

  public async RefreshSourceToken(): Promise<boolean>{

    let sourceUpdateStatus = await this.refreshExpiredTokenIfRequired(this.source)
    this.source = sourceUpdateStatus.source
    return sourceUpdateStatus.is_updated
  }


  /////////////////////////////////////////////////////////////////////////////
  // Protected methods
  /////////////////////////////////////////////////////////////////////////////


  /////////////////////////////////////////////////////////////////////////////
  // Private methods
  /////////////////////////////////////////////////////////////////////////////

  private async refreshExpiredTokenIfRequired(source: Source): Promise<SourceUpdateStatus> {
    const sourceUpdateStatus = new SourceUpdateStatus()
    //check if token has expired, and a refreshtoken is available
    // Note: source.expires_at is in seconds, Date.now() is in milliseconds.
    if(source.expires_at > Math.floor(Date.now() / 1000)) { //not expired  return
      sourceUpdateStatus.source = source
      return Promise.resolve(sourceUpdateStatus)
    }
    if(!source.refresh_token){
      return Promise.reject(new Error("access token is expired, but no refresh token available"))
    }

    console.log("access token expired, refreshing...")
    return Oauth.refreshTokenGrantRequest(this.oauthAuthorizationServer, this.oauthClient, source.refresh_token)
      .then((refreshTokenResp) => {
        return Oauth.processRefreshTokenResponse(this.oauthAuthorizationServer, this.oauthClient, refreshTokenResp)
      })
      .then((newToken) => {

        if(newToken.access_token != source.access_token){
          sourceUpdateStatus.is_updated = true
          // {
          //   access_token: 'token',
          //   token_type: 'bearer',
          //   expires_in: 60,
          //   scope: 'api:read',
          //   refresh_token: 'refresh_token',
          // }

          source.access_token = newToken.access_token as string
          // @ts-ignore
          source.expires_at = Math.floor(Date.now() / 1000) + parseInt(newToken.expires_in);

          // update the "source" credential with new data (which will need to be sent
          // Don't overwrite `RefreshToken` with an empty value
          if(newToken.refresh_token != ""){
            source.refresh_token = newToken.refresh_token as string
          }
        }
        sourceUpdateStatus.source = source
        return sourceUpdateStatus
      })
  }
}
