import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import 'fhir-js-client';
import * as Oauth from '@panva/oauth4webapi';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'fastenhealth';


  constructor(private http: HttpClient) { }

  connect(provider: string) {
    this.http.get<any>(`https://sandbox-api.fastenhealth.com/v1/connect/${provider}`)
      .subscribe(async (data: any) => {
        console.log(data);

        // https://github.com/panva/oauth4webapi/blob/8eba19eac408bdec5c1fe8abac2710c50bfadcc3/examples/public.ts
        const codeVerifier = Oauth.generateRandomCodeVerifier();
        const codeChallenge = await Oauth.calculatePKCECodeChallenge(codeVerifier);
        const codeChallengeMethod = 'S256';

        // generate the authorization url

        const authorizationUrl = new URL(`${data.message.server_url}/authorize`);
        authorizationUrl.searchParams.set('client_id', data.message.client_id);
        authorizationUrl.searchParams.set('code_challenge', codeChallenge);
        authorizationUrl.searchParams.set('code_challenge_method', codeChallengeMethod);
        authorizationUrl.searchParams.set('redirect_uri', data.message.redirect_uri);
        authorizationUrl.searchParams.set('response_type', 'code');
        authorizationUrl.searchParams.set('scope', data.message.scopes.join(' '));
        authorizationUrl.searchParams.set('state', 'hello-world-my-friend');
        if (data.message.aud){
          authorizationUrl.searchParams.set('aud', data.message.aud);
        }
        console.log('authorize url:', authorizationUrl);
      });


  }
}


