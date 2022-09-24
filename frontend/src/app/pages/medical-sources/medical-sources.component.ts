import {Component, HostListener, OnInit} from '@angular/core';
import {LighthouseService} from '../../services/lighthouse.service';
import {FastenApiService} from '../../services/fasten-api.service';
import {LighthouseSource} from '../../models/lighthouse/lighthouse-source';
import * as Oauth from '@panva/oauth4webapi';
import {AuthorizeClaim} from '../../models/lighthouse/authorize-claim';
import {Source} from '../../models/fasten/source';
import {getAccessTokenExpiration, jwtDecode} from 'fhirclient/lib/lib';
import BrowserAdapter from 'fhirclient/lib/adapters/BrowserAdapter';
import {Observable, of, throwError} from 'rxjs';
import {concatMap, delay, retryWhen} from 'rxjs/operators';
import * as FHIR from "fhirclient"
import {MetadataSource} from '../../models/fasten/metadata-source';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';

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
    private modalService: NgbModal,
  ) { }
  status: { [name: string]: string } = {}

  metadataSources: {[name:string]: MetadataSource} = {}

  connectedSourceList:any[] = []
  availableSourceList:MetadataSource[] = []

  uploadedFile: File[] = []

  closeResult = '';
  modalSourceInfo:any = null;

  ngOnInit(): void {
    this.fastenApi.getMetadataSources().subscribe((metadataSources: {[name:string]: MetadataSource}) => {
      this.metadataSources = metadataSources

      this.fastenApi.getSources()
        .subscribe((sourceList: Source[]) => {

          for (const sourceType in this.metadataSources) {
            let isConnected = false
            for(const connectedSource of sourceList){
              if(connectedSource.source_type == sourceType){
                this.connectedSourceList.push({source: connectedSource, metadata: this.metadataSources[sourceType]})
                isConnected = true
                break
              }
            }

            if(!isConnected){
              //this source has not been found in the connected list, lets add it to the available list.
              this.availableSourceList.push(this.metadataSources[sourceType])
            }
          }

        })
    })


  }

  connect($event: MouseEvent, sourceType: string) {
    ($event.currentTarget as HTMLButtonElement).disabled = true;
    this.status[sourceType] = "authorize"

    this.lighthouseApi.getLighthouseSource(sourceType)
      .subscribe(async (connectData: LighthouseSource) => {
        console.log(connectData);

        const state = this.uuidV4()

        let authorizationUrl

        //only set if this is not a "confidential" source.
        let codeVerifier
        let codeChallenge
        let codeChallengeMethod

        if(connectData.confidential){
          authorizationUrl = this.lighthouseApi.generateConfidentialSourceAuthorizeUrl(state, connectData)
        } else {
          // https://github.com/panva/oauth4webapi/blob/8eba19eac408bdec5c1fe8abac2710c50bfadcc3/examples/public.ts
          codeVerifier = Oauth.generateRandomCodeVerifier();
          codeChallenge = await Oauth.calculatePKCECodeChallenge(codeVerifier);
          codeChallengeMethod = 'S256';

          authorizationUrl = this.lighthouseApi.generatePKCESourceAuthorizeUrl(codeVerifier, codeChallenge, codeChallengeMethod, state, connectData)
        }

        console.log('authorize url:', authorizationUrl.toString());
        // open new browser window
        window.open(authorizationUrl.toString(), "_blank");

        //wait for response
        this.waitForClaimOrTimeout(sourceType, state).subscribe(async (claimData: AuthorizeClaim) => {
          console.log("claim response:", claimData)
          this.status[sourceType] = "token"

          let payload: any
          if(connectData.confidential){

            // we should have an access_token (and optionally a refresh_token) in the claim
            payload = claimData

          } else {
            payload = await this.swapOauthPKCEToken(state, codeVerifier, authorizationUrl, connectData, claimData)
          }



          //If payload.patient is not set, make sure we extract the patient ID from the id_token or make an introspection req
          if(!payload.patient && payload.id_token){
            //
            console.log("NO PATIENT ID present, decoding jwt to extract patient")
            //const introspectionResp = await Oauth.introspectionRequest(as, client, payload.access_token)
            //console.log(introspectionResp)
            payload.patient = jwtDecode(payload.id_token, new BrowserAdapter())["profile"].replace(/^(Patient\/)/,'')
          }



          //Create FHIR Client

          const sourceCredential: Source = {
            source_type: sourceType,
            oauth_authorization_endpoint: connectData.oauth_authorization_endpoint,
            oauth_token_endpoint: connectData.oauth_token_endpoint,
            oauth_registration_endpoint: connectData.oauth_registration_endpoint,
            oauth_introspection_endpoint: connectData.oauth_introspection_endpoint,
            oauth_token_endpoint_auth_methods_supported: connectData.oauth_token_endpoint_auth_methods_supported,
            api_endpoint_base_url:   connectData.api_endpoint_base_url,
            client_id:             connectData.client_id,
            redirect_uri:          connectData.redirect_uri,
            scopes:               connectData.scopes ? connectData.scopes.join(' ') : undefined,
            patient_id:            payload.patient,
            access_token:          payload.access_token,
            refresh_token:          payload.refresh_token,
            id_token:              payload.id_token,
            code_challenge:        codeChallenge,
            code_verifier:         codeVerifier,

            // @ts-ignore - in some cases the getAccessTokenExpiration is a string, which cases failures to store Source in db.
            expires_at:            parseInt(getAccessTokenExpiration(payload, new BrowserAdapter())),
            confidential: connectData.confidential
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

  uploadSourceBundle(event) {
    this.uploadedFile = [event.addedFiles[0]]
    this.fastenApi.createManualSource(event.addedFiles[0]).subscribe(
      (respData) => {
        console.log("source manual source create response:", respData)
      },
      (err) => {console.log(err)},
      () => {
        this.uploadedFile = []
      }
    )
  }

  openModal(contentModalRef, sourceInfo: any) {
    this.modalSourceInfo = sourceInfo
    let modalSourceInfo = this.modalSourceInfo
    this.modalService.open(contentModalRef, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      modalSourceInfo = null
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      modalSourceInfo = null
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  syncSource(source: Source){
    this.modalService.dismissAll()
    this.fastenApi.syncSource(source.id).subscribe(
      (respData) => {
        console.log("source sync response:", respData)
      },
      (err) => {console.log(err)},
    )
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  private waitForClaimOrTimeout(sourceType: string, state: string): Observable<AuthorizeClaim> {
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

  private uuidV4(){
    // @ts-ignore
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }

  private async swapOauthPKCEToken(state: string, codeVerifier: any, authorizationUrl: URL, connectData: LighthouseSource, claimData: AuthorizeClaim){
    // @ts-expect-error
    const client: oauth.Client = {
      client_id: connectData.client_id,
      token_endpoint_auth_method: 'none',
    }

    //check if the oauth_token_endpoint_auth_methods_supported field is set
    if(connectData.oauth_token_endpoint_auth_methods_supported){
      let auth_methods = connectData.oauth_token_endpoint_auth_methods_supported.split(",")
      client.token_endpoint_auth_method = auth_methods[0]
    }

    const as = {
      issuer: `${authorizationUrl.protocol}//${authorizationUrl.host}`,
      authorization_endpoint:	connectData.oauth_authorization_endpoint,
      token_endpoint:	connectData.oauth_token_endpoint,
      introspection_endpoint: connectData.oauth_introspection_endpoint,
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
    let payload = await response.json()
    console.log("ENDING--- Oauth.authorizationCodeGrantRequest", payload)
    return payload
  }

}
