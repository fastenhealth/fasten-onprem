import {Component, HostListener, OnInit} from '@angular/core';
import {LighthouseService} from '../../services/lighthouse.service';
import {FastenApiService} from '../../services/fasten-api.service';
import {LighthouseSourceMetadata} from '../../models/lighthouse/lighthouse-source-metadata';
import * as Oauth from '@panva/oauth4webapi';
import {AuthorizeClaim} from '../../models/lighthouse/authorize-claim';
import {Source} from '../../models/fasten/source';
import {getAccessTokenExpiration, jwtDecode} from 'fhirclient/lib/lib';
import BrowserAdapter from 'fhirclient/lib/adapters/BrowserAdapter';
import {Observable, of, throwError, fromEvent } from 'rxjs';
import {concatMap, delay, retryWhen, timeout, first, map, filter, catchError} from 'rxjs/operators';
import * as FHIR from "fhirclient"
import {MetadataSource} from '../../models/fasten/metadata-source';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import {ActivatedRoute, Router} from '@angular/router';
import {Location} from '@angular/common';
// If you dont import this angular will import the wrong "Location"

export const sourceConnectWindowTimeout = 24*5000 //wait 2 minutes (5 * 24 = 120)

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
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
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

      const callbackSourceType = this.route.snapshot.paramMap.get('source_type')
      if(callbackSourceType){
        this.callback(callbackSourceType).then(console.log)
      }

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
      .subscribe(async (sourceMetadata: LighthouseSourceMetadata) => {
        console.log(sourceMetadata);
        let authorizationUrl = await this.lighthouseApi.generateSourceAuthorizeUrl(sourceType, sourceMetadata)

        console.log('authorize url:', authorizationUrl.toString());
        // redirect to lighthouse with uri's
        this.lighthouseApi.redirectWithOriginAndDestination(authorizationUrl.toString(), sourceType)

      });
  }

  async callback(sourceType: string) {

    //get the source metadata again
    await this.lighthouseApi.getLighthouseSource(sourceType)
      .subscribe(async (sourceMetadata: LighthouseSourceMetadata) => {

        //get required parameters from the URI and local storage
        const callbackUrlParts = new URL(window.location.href)
        const fragmentParams = new URLSearchParams(callbackUrlParts.hash.substring(1))
        const callbackCode = callbackUrlParts.searchParams.get("code") || fragmentParams.get("code")
        const callbackState = callbackUrlParts.searchParams.get("state") || fragmentParams.get("state")
        const callbackError = callbackUrlParts.searchParams.get("error") || fragmentParams.get("error")
        const callbackErrorDescription = callbackUrlParts.searchParams.get("error_description") || fragmentParams.get("error_description")

        //reset the url, removing the params and fragment from the current url.
        const urlTree = this.router.createUrlTree(["/sources"],{
          relativeTo: this.route,
        });
        this.location.replaceState(urlTree.toString());

        const expectedState = localStorage.getItem(`${sourceType}:state`)
        localStorage.removeItem(`${sourceType}:state`)


        if(callbackError && !callbackCode){
          //TOOD: print this message in the UI
          console.error("an error occurred while authenticating to this source. Please try again later", callbackErrorDescription)
          return
        }

        console.log("callback code:", callbackCode)
        this.status[sourceType] = "token"

        let payload: any
        payload = await this.lighthouseApi.swapOauthToken(sourceType, sourceMetadata,expectedState, callbackState, callbackCode)


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
          oauth_authorization_endpoint: sourceMetadata.authorization_endpoint,
          oauth_token_endpoint: sourceMetadata.token_endpoint,
          oauth_registration_endpoint: "",
          oauth_introspection_endpoint: sourceMetadata.introspection_endpoint,
          oauth_userinfo_endpoint: sourceMetadata.userinfo_endpoint,
          oauth_token_endpoint_auth_methods_supported: "",
          api_endpoint_base_url:   sourceMetadata.api_endpoint_base_url,
          client_id:             sourceMetadata.client_id,
          redirect_uri:          sourceMetadata.redirect_uri,
          scopes:               sourceMetadata.scopes_supported ? sourceMetadata.scopes_supported.join(' ') : undefined,
          patient_id:            payload.patient,
          access_token:          payload.access_token,
          refresh_token:          payload.refresh_token,
          id_token:              payload.id_token,
          code_challenge:        "",
          code_verifier:         "",

          // @ts-ignore - in some cases the getAccessTokenExpiration is a string, which cases failures to store Source in db.
          expires_at:            parseInt(getAccessTokenExpiration(payload, new BrowserAdapter())),
          confidential: sourceMetadata.confidential
        }

        await this.fastenApi.createSource(sourceCredential).subscribe(
          (respData) => {
            delete this.status[sourceType]
            // window.location.reload();

            console.log("source credential create response:", respData)
          },
          (err) => {
            delete this.status[sourceType]
            // window.location.reload();

            console.log(err)
          }
        )
      })
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
    this.status[source.source_type] = "authorize"
    this.modalService.dismissAll()
    this.fastenApi.syncSource(source.id).subscribe(
      (respData) => {
        delete this.status[source.source_type]
        console.log("source sync response:", respData)
      },
      (err) => {
        delete this.status[source.source_type]
        console.log(err)
      }
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

}
