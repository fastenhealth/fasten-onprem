import { Component, OnInit } from '@angular/core';
import {PassportService} from '../../services/passport.service';
import {FastenApiService} from '../../services/fasten-api.service';
import {ProviderConfig} from '../../models/passport/provider-config';
import * as Oauth from '@panva/oauth4webapi';
import {AuthorizeClaim} from '../../models/passport/authorize-claim';
import {ProviderCredential} from '../../models/fasten/provider-credential';
import {getAccessTokenExpiration} from 'fhirclient/lib/lib';
import BrowserAdapter from 'fhirclient/lib/adapters/BrowserAdapter';
import {Observable, of, throwError} from 'rxjs';
import {concatMap, delay, retryWhen} from 'rxjs/operators';
import * as FHIR from "fhirclient"

export const retryCount = 24; //wait 2 minutes (5 * 24 = 120)
export const retryWaitMilliSeconds = 5000; //wait 5 seconds

@Component({
  selector: 'app-medical-providers',
  templateUrl: './medical-providers.component.html',
  styleUrls: ['./medical-providers.component.scss']
})
export class MedicalProvidersComponent implements OnInit {

  constructor(
    private passportApi: PassportService,
    private fastenApi: FastenApiService,
  ) { }

  ngOnInit(): void {
  }

  connect(provider: string) {
    this.passportApi.getProviderConfig(provider)
      .subscribe(async (connectData: ProviderConfig) => {
        console.log(connectData);

        // https://github.com/panva/oauth4webapi/blob/8eba19eac408bdec5c1fe8abac2710c50bfadcc3/examples/public.ts
        const codeVerifier = Oauth.generateRandomCodeVerifier();
        const codeChallenge = await Oauth.calculatePKCECodeChallenge(codeVerifier);
        const codeChallengeMethod = 'S256';
        const state = this.uuidV4()

        const authorizationUrl = this.passportApi.generatePKCEProviderAuthorizeUrl(codeVerifier, codeChallenge, codeChallengeMethod, state, connectData)

        console.log('authorize url:', authorizationUrl.toString());
        // open new browser window
        window.open(authorizationUrl.toString(), "_blank");

        //wait for response
        this.waitForClaimOrTimeout(provider, state).subscribe(async (claimData: AuthorizeClaim) => {
          console.log("claim response:", claimData)


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
          const providerCredential: ProviderCredential = {
            oauth_endpoint_base_url: connectData.oauth_endpoint_base_url,
            api_endpoint_base_url:   connectData.api_endpoint_base_url,
            client_id:             connectData.client_id,
            redirect_uri:          connectData.redirect_uri,
            scopes:               connectData.scopes.join(' '),
            patient:            payload.patient,
            access_token:          payload.access_token,
            refresh_token:          payload.refresh_token,
            id_token:              payload.id_token,
            expires_at:            getAccessTokenExpiration(payload, new BrowserAdapter()),
            code_challenge:        codeChallenge,
            code_verifier:         codeVerifier,
          }

          this.fastenApi.createProviderCredential(providerCredential).subscribe( (respData) => {
            console.log("provider credential create response:", respData)
          })




          // console.log("STARTING--- FHIR.client(clientState)", clientState)
          // const fhirClient = FHIR.client(clientState);
          //
          // console.log("STARTING--- client.request(Patient)")
          // const patientResponse = await fhirClient.request("PatientAccess/v1/$userinfo")
          // console.log(patientResponse)





          // // fetch userinfo response
          //
          // const response = await oauth.userInfoRequest(as, client, access_token)
          //
          // let challenges: oauth.WWWAuthenticateChallenge[] | undefined
          // if ((challenges = oauth.parseWwwAuthenticateChallenges(response))) {
          //   for (const challenge of challenges) {
          //     console.log('challenge', challenge)
          //   }
          //   throw new Error() // Handle www-authenticate challenges as needed
          // }
          //
          // const result = await oauth.processUserInfoResponse(as, client, sub, response)
          // console.log('result', result)



        })

      });
  }
  waitForClaimOrTimeout(providerId: string, state: string): Observable<any> {
    return this.passportApi.getProviderAuthorizeClaim(providerId, state).pipe(
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
