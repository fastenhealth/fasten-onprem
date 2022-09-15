import {Component, HostListener, OnInit} from '@angular/core';
import {LighthouseService} from '../../services/lighthouse.service';
import {FastenApiService} from '../../services/fasten-api.service';
import {LighthouseSource} from '../../models/lighthouse/lighthouse-source';
import * as Oauth from '@panva/oauth4webapi';
import {AuthorizeClaim} from '../../models/lighthouse/authorize-claim';
import {Source} from '../../models/fasten/source';
import {getAccessTokenExpiration} from 'fhirclient/lib/lib';
import BrowserAdapter from 'fhirclient/lib/adapters/BrowserAdapter';
import {Observable, of, throwError} from 'rxjs';
import {concatMap, delay, retryWhen} from 'rxjs/operators';
import * as FHIR from "fhirclient"

export const retryCount = 24; //wait 2 minutes (5 * 24 = 120)
export const retryWaitMilliSeconds = 5000; //wait 5 seconds

@Component({
  selector: 'app-medical-sources',
  templateUrl: './medical-sources.component.html',
  styleUrls: ['./medical-sources.component.scss']
})
export class MedicalSourcesComponent implements OnInit {

  constructor(
    private lighthouseApi: LighthouseService,
    private fastenApi: FastenApiService,
  ) { }
  status: { [name: string]: string } = {}

  sourceLookup = {
    "aetna": {"display": "Aetna"},
    "anthem": {"display": "Anthem"},
    "cigna": {"display": "Cigna"},
    "humana": {"display": "Humana"},
    "kaiser": {"display": "Kaiser"},
    "unitedhealthcare": {"display": "United Healthcare"},
  }

  connectedSourceList = []
  availableSourceList = []




  ngOnInit(): void {
    this.fastenApi.getSources()
      .subscribe((sourceList: Source[]) => {

        for (const sourceType in this.sourceLookup) {
          let isConnected = false
          for(const connectedSource of sourceList){
            if(connectedSource.source_type == sourceType){
              this.connectedSourceList.push({"source_type": sourceType, "display": this.sourceLookup[sourceType]["display"]})
              isConnected = true
              break
            }
          }

          if(!isConnected){
            //this source has not been found in the connected list, lets add it to the available list.
            this.availableSourceList.push({"source_type": sourceType, "display": this.sourceLookup[sourceType]["display"]})
          }
        }

      })
  }

  connect($event: MouseEvent, sourceType: string) {
    ($event.currentTarget as HTMLButtonElement).disabled = true;
    this.status[sourceType] = "authorize"

    this.lighthouseApi.getLighthouseSource(sourceType)
      .subscribe(async (connectData: LighthouseSource) => {
        console.log(connectData);

        // https://github.com/panva/oauth4webapi/blob/8eba19eac408bdec5c1fe8abac2710c50bfadcc3/examples/public.ts
        const codeVerifier = Oauth.generateRandomCodeVerifier();
        const codeChallenge = await Oauth.calculatePKCECodeChallenge(codeVerifier);
        const codeChallengeMethod = 'S256';
        const state = this.uuidV4()

        const authorizationUrl = this.lighthouseApi.generatePKCESourceAuthorizeUrl(codeVerifier, codeChallenge, codeChallengeMethod, state, connectData)

        console.log('authorize url:', authorizationUrl.toString());
        // open new browser window
        window.open(authorizationUrl.toString(), "_blank");

        //wait for response
        this.waitForClaimOrTimeout(sourceType, state).subscribe(async (claimData: AuthorizeClaim) => {
          console.log("claim response:", claimData)
          this.status[sourceType] = "token"

          //swap code for token
          let sub: string
          let access_token: string

          // @ts-expect-error
          const client: oauth.Client = {
            client_id: connectData.client_id,
            token_endpoint_auth_method: 'none',
          }

          const as = {
            issuer: `${authorizationUrl.protocol}//${authorizationUrl.host}`,
            authorization_endpoint:	`${connectData.oauth_endpoint_base_url}/authorize`,
            token_endpoint:	`${connectData.oauth_endpoint_base_url}/token`,
            introspect_endpoint: `${connectData.oauth_endpoint_base_url}/introspect`,
          }

          console.log("STARTING--- Oauth.validateAuthResponse")
          const params = Oauth.validateAuthResponse(as, client, new URLSearchParams(claimData as any), state)
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
            connectData.redirect_uri,
            codeVerifier,
          )
          const payload = await response.json()
          console.log("ENDING--- Oauth.authorizationCodeGrantRequest", payload)


          //Create FHIR Client
          const sourceCredential: Source = {
            source_type: sourceType,
            oauth_endpoint_base_url: connectData.oauth_endpoint_base_url,
            api_endpoint_base_url:   connectData.api_endpoint_base_url,
            client_id:             connectData.client_id,
            redirect_uri:          connectData.redirect_uri,
            scopes:               connectData.scopes.join(' '),
            patient_id:            payload.patient,
            access_token:          payload.access_token,
            refresh_token:          payload.refresh_token,
            id_token:              payload.id_token,
            expires_at:            getAccessTokenExpiration(payload, new BrowserAdapter()),
            code_challenge:        codeChallenge,
            code_verifier:         codeVerifier,
          }

          await this.fastenApi.createSource(sourceCredential).subscribe(
            (respData) => {
                console.log("source credential create response:", respData)
              },
            (err) => {console.log(err)},
            () => {
              delete this.status[sourceType]
              //reload the current page after finishing connection
              window.location.reload();
            }
          )


        })

      });
  }

  @HostListener('window:message', ['$event'])
  onPostMessage(event: MessageEvent) {
    console.log("received a message from OAuth popup - "+ event.data, "sleeping 5 seconds")
    // todo, process event, (retrieve code from passport api and swap for code)
    setTimeout(() => {
      console.log("responding to OAuth popup...")
      event.source.postMessage(JSON.stringify({close:true}),
        // @ts-ignore
        event.origin);
    }, 5000);


  }



  waitForClaimOrTimeout(sourceType: string, state: string): Observable<AuthorizeClaim> {
    return this.lighthouseApi.getSourceAuthorizeClaim(sourceType, state).pipe(
      retryWhen(error =>
        error.pipe(
          concatMap((error, count) => {
            if (count <= retryCount && error.status == 500) {
              return of(error);
            }
            return throwError(error);
          }),
          delay(retryWaitMilliSeconds)
        )
      )
    )
  }

  uuidV4(){
    // @ts-ignore
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }
}