import {Component, Input, OnInit} from '@angular/core';
import {Source} from '../../models/fasten/source';
import {SourceListItem} from '../../pages/medical-sources/medical-sources.component';
import {ModalDismissReasons, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FastenApiService} from '../../services/fasten-api.service';
import {forkJoin} from 'rxjs';
import {LighthouseService} from '../../services/lighthouse.service';
import {LighthouseSourceMetadata} from '../../models/lighthouse/lighthouse-source-metadata';
import {ToastNotification, ToastType} from '../../models/fasten/toast';
import {ToastService} from '../../services/toast.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Location} from '@angular/common';
import {EventBusService} from '../../services/event-bus.service';
import {SourceState} from '../../models/fasten/source-state';

@Component({
  selector: 'app-medical-sources-connected',
  templateUrl: './medical-sources-connected.component.html',
  styleUrls: ['./medical-sources-connected.component.scss']
})
export class MedicalSourcesConnectedComponent implements OnInit {
  loading: boolean = false
  status: { [name: string]:  undefined | "token" | "authorize" | "failed" } = {}

  modalSelectedSourceListItem:SourceListItem = null;
  modalCloseResult = '';

  connectedSourceList: SourceListItem[] = [] //source's are populated for this list

  constructor(
    private lighthouseApi: LighthouseService,
    private fastenApi: FastenApiService,
    private modalService: NgbModal,
    private toastService: ToastService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private location: Location,
    private eventBusService: EventBusService,
  ) { }

  ngOnInit(): void {
    this.loading = true
    this.fastenApi.getSources().subscribe(results => {
      this.loading = false

      //handle connected sources sources
      const connectedSources = results as Source[]
      forkJoin(connectedSources.map((source) => this.lighthouseApi.getLighthouseSource(source.source_type))).subscribe((connectedMetadata) => {
        for(const ndx in connectedSources){
          this.connectedSourceList.push({source: connectedSources[ndx], metadata: connectedMetadata[ndx]})
          if(connectedSources[ndx].latest_background_job?.job_status == "STATUS_LOCKED"){
            this.status[connectedSources[ndx].source_type] = "token"
          } else if (connectedSources[ndx].latest_background_job?.job_status === "STATUS_FAILED") {
            this.status[connectedSources[ndx].source_type] = "failed"
          }
        }
      })
    })

    const callbackSourceType = this.activatedRoute.snapshot.paramMap.get('source_type')
    if(callbackSourceType) {
      console.log("handle callback redirect from source")
      this.status[callbackSourceType] = "token"

      //the structure of "availableSourceList" vs "connectedSourceList" sources is slightly different,
      //connectedSourceList contains a "source" field. The this.fastenApi.createSource() call in the callback function will set it.
      this.lighthouseApi.getLighthouseSource(callbackSourceType)
        .then((metadata) => {
          this.connectedSourceList.push({metadata: metadata})
          return this.callback(callbackSourceType)
        })
        .then(console.log)
    }

    this.eventBusService.SourceSyncMessages.subscribe((event) => {
      this.status[event.source_id] = "token"
    })

  }

  /**
   * if the user is redirected to this page from the lighthouse, we'll need to process the "code" to retrieve the access token & refresh token.
   * @param sourceType
   */
  public async callback(sourceType: string) {

    //get the source metadata again
    await this.lighthouseApi.getLighthouseSource(sourceType)
      .then(async (sourceMetadata: LighthouseSourceMetadata) => {

        //get required parameters from the URI and local storage
        const callbackUrlParts = new URL(window.location.href)
        //in desktop mode, we're using fragment routing, and the callback params are in the fragment.
        const fragmentParams = new URLSearchParams(callbackUrlParts.hash.split('?')?.[1] || '')
        const callbackCode = callbackUrlParts.searchParams.get("code") || fragmentParams.get("code")
        const callbackState = callbackUrlParts.searchParams.get("state") || fragmentParams.get("state")
        const callbackError = callbackUrlParts.searchParams.get("error") || fragmentParams.get("error")
        const callbackErrorDescription = callbackUrlParts.searchParams.get("error_description") || fragmentParams.get("error_description")

        //reset the url, removing the params and fragment from the current url.
        const urlTree = this.router.createUrlTree(["/sources"],{
          relativeTo: this.activatedRoute,
        });
        this.location.replaceState(urlTree.toString());

        const expectedSourceStateInfo = JSON.parse(localStorage.getItem(callbackState)) as SourceState
        localStorage.removeItem(callbackState)

        if(callbackError && !callbackCode){
          //TOOD: print this message in the UI
          let errMsg = "an error occurred while authenticating to this source. Please try again later"
          console.error(errMsg, callbackErrorDescription)
          throw new Error(errMsg)
        }

        console.log("callback code:", callbackCode)
        this.status[sourceType] = "token"

        let payload: any
        payload = await this.lighthouseApi.swapOauthToken(sourceType, sourceMetadata,expectedSourceStateInfo, callbackCode)

        if(!payload.access_token || payload.error){
          //if the access token is not set, then something is wrong,
          let errMsg = payload.error || "unable to retrieve access_token"
          console.error(errMsg)
          throw new Error(errMsg)
        }

        //If payload.patient is not set, make sure we extract the patient ID from the id_token or make an introspection req
        if(!payload.patient && payload.id_token){
          //
          console.log("NO PATIENT ID present, decoding jwt to extract patient")
          //const introspectionResp = await Oauth.introspectionRequest(as, client, payload.access_token)
          //console.log(introspectionResp)
          let decodedIdToken = this.jwtDecode(payload.id_token)
          //nextGen uses fhirUser instead of profile.
          payload.patient = decodedIdToken["patient"] || decodedIdToken["profile"] || decodedIdToken["fhirUser"]

          if(payload.patient && payload.patient.includes("Patient/")){
            //remove the "Patient/" or "https://example.com/fhir/Patient/" prefix if it exists
            payload.patient = payload.patient.split("Patient/")[1]
          }

        }



        //Create FHIR Client

        const dbSourceCredential = new Source({
          id: expectedSourceStateInfo.reconnect_source_id,
          source_type: sourceType,

          authorization_endpoint: sourceMetadata.authorization_endpoint,
          token_endpoint: sourceMetadata.token_endpoint,
          introspection_endpoint: sourceMetadata.introspection_endpoint,
          userinfo_endpoint: sourceMetadata.userinfo_endpoint,
          registration_endpoint: sourceMetadata.registration_endpoint,
          api_endpoint_base_url:   sourceMetadata.api_endpoint_base_url,
          client_id:             sourceMetadata.client_id,
          redirect_uri:          sourceMetadata.redirect_uri,
          scopes_supported:      sourceMetadata.scopes_supported,
          issuer: sourceMetadata.issuer,
          grant_types_supported: sourceMetadata.grant_types_supported,
          response_types_supported: sourceMetadata.response_types_supported,
          aud: sourceMetadata.aud,
          code_challenge_methods_supported: sourceMetadata.code_challenge_methods_supported || [],
          confidential: sourceMetadata.confidential,
          cors_relay_required: sourceMetadata.cors_relay_required,

          patient:            payload.patient,
          access_token:          payload.access_token,
          refresh_token:          payload.refresh_token,
          id_token:              payload.id_token,

          dynamic_client_registration_mode:  sourceMetadata.dynamic_client_registration_mode,

          // @ts-ignore - in some cases the getAccessTokenExpiration is a string, which cases failures to store Source in db.
          expires_at:            parseInt(this.getAccessTokenExpiration(payload)),
        })

        this.fastenApi.createSource(dbSourceCredential)
          .subscribe((resp) => {
              // const sourceSyncMessage = JSON.parse(msg) as SourceSyncMessage
              delete this.status[sourceType]
              delete this.status[resp.source.id]
              // window.location.reload();
              // this.connectedSourceList.

              //find the index of the "inprogress" source in the connected List, and then add this source to its source metadata.
              let foundSource = this.connectedSourceList.findIndex((item) => item.metadata.source_type == sourceType)
              this.connectedSourceList[foundSource].source = resp.source

              console.log("source sync-all response:", resp.summary)

              const toastNotification = new ToastNotification()
              toastNotification.type = ToastType.Success
              toastNotification.message = `Successfully connected ${sourceType}`

              // const upsertSummary = sourceSyncMessage.response as UpsertSummary
              // if(upsertSummary && upsertSummary.totalResources != upsertSummary.updatedResources.length){
              //   toastNotification.message += `\n (total: ${upsertSummary.totalResources}, updated: ${upsertSummary.updatedResources.length})`
              // } else if(upsertSummary){
              //   toastNotification.message += `\n (total: ${upsertSummary.totalResources})`
              // }

              this.toastService.show(toastNotification)
            },
            (err) => {
              delete this.status[sourceType]
              // window.location.reload();

              const toastNotification = new ToastNotification()
              toastNotification.type = ToastType.Error
              toastNotification.message = `An error occurred while accessing ${sourceType}: '${this.extractErrorFromResponse(err)}'`
              toastNotification.autohide = false
              toastNotification.link = {
                text: "View Details",
                url: `/background-jobs`
              }
              this.toastService.show(toastNotification)
              console.error(err)
            });
      })
      .catch((err) => {
        delete this.status[sourceType]
        // window.location.reload();

        const toastNotification = new ToastNotification()
        toastNotification.type = ToastType.Error
        toastNotification.message = `An error occurred while accessing ${sourceType}: '${JSON.stringify(err)}'`
        toastNotification.autohide = false
        this.toastService.show(toastNotification)
        console.error(err)
      })
  }

  extractErrorFromResponse(errResp: any): string {
    let errMsg = ""
    if(errResp.name == "HttpErrorResponse" && errResp.error && errResp.error?.error){
      errMsg = errResp.error.error
    } else {
      errMsg = JSON.stringify(errResp)
    }
    return errMsg
  }


  /**
   * https://github.com/smart-on-fhir/client-js/blob/8f64b770dbcd0abd30646e239cd446dfa4d831f6/src/lib.ts#L311
   * Decodes a JWT token and returns it's body.
   * @param token The token to read
   * @param env An `Adapter` or any other object that has an `atob` method
   * @category Utility
   */
  private jwtDecode(token: string): Record<string, any> | null
  {
    const payload = token.split(".")[1];
    return payload ? JSON.parse(atob(payload)) : null;
  }

  /**
   * https://github.com/smart-on-fhir/client-js/blob/8f64b770dbcd0abd30646e239cd446dfa4d831f6/src/lib.ts#L334
   * Given a token response, computes and returns the expiresAt timestamp.
   * Note that this should only be used immediately after an access token is
   * received, otherwise the computed timestamp will be incorrect.
   * @param tokenResponse
   * @param env
   */
  public getAccessTokenExpiration(tokenResponse: any): number
  {
    const now = Math.floor(Date.now() / 1000);

    // Option 1 - using the expires_in property of the token response
    if (tokenResponse.expires_in) {
      return now + parseInt(tokenResponse.expires_in);
    }

    // Option 2 - using the exp property of JWT tokens (must not assume JWT!)
    if (tokenResponse.access_token) {

      let tokenBody = this.jwtDecode(tokenResponse.access_token);
      if (tokenBody && tokenBody['exp']) {
        return parseInt(tokenBody['exp']);
      }
    }

    // Option 3 - if none of the above worked set this to 5 minutes after now
    return now + 300;
  }


  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Modal Window Functions
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  public openModal(contentModalRef, sourceListItem: SourceListItem) {
    if(
      (this.status[sourceListItem.metadata.source_type] && this.status[sourceListItem.metadata.source_type] != 'failed') //if this source type is currently "loading" dont open the modal window
      || !sourceListItem.source //if there's no connected source, dont open the modal window
      || (this.status[sourceListItem.source.id] && this.status[sourceListItem.source.id] != 'failed') //if this source type is currently "loading" dont open the modal window
    ){
      //if this source is currently "loading" dont open the modal window
      return
    }

    this.modalSelectedSourceListItem = sourceListItem
    this.modalService.open(contentModalRef, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.modalSelectedSourceListItem = null
      this.modalCloseResult = `Closed with: ${result}`;
    }, (reason) => {
      this.modalSelectedSourceListItem = null
      this.modalCloseResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }



  public sourceSyncHandler(source: Source){
    this.status[source.id] = "authorize"
    this.modalService.dismissAll()

    this.fastenApi.syncSource(source.id).subscribe(
      (respData) => {
        delete this.status[source.id]
        delete this.status[source.source_type]
        console.log("source sync response:", respData)
      },
      (err) => {
        delete this.status[source.id]
        delete this.status[source.source_type]
        console.log(err)
      }
    )
  }

  public sourceDeleteHandler(){
    let source = this.modalSelectedSourceListItem.source
    let sourceDisplayName = this.modalSelectedSourceListItem?.metadata?.display || this.modalSelectedSourceListItem?.source?.source_type || 'unknown'

    this.status[source.id] = "authorize"
    this.modalService.dismissAll()

    this.fastenApi.deleteSource(source.id).subscribe(
      (respData) => {
        delete this.status[source.id]
        delete this.status[source.source_type]

        //delete this source from the connnected list
        let foundIndex = this.connectedSourceList.findIndex((connectedSource) => {
          return connectedSource?.source?.id == source.id
        }, this)
        if(foundIndex > -1){
          this.connectedSourceList.splice(foundIndex, 1)
        }

        console.log("source delete response:", respData)


        const toastNotification = new ToastNotification()
        toastNotification.type = ToastType.Success
        toastNotification.message = `Successfully deleted source: ${sourceDisplayName}, ${respData} row(s) effected`
        this.toastService.show(toastNotification)

      },
      (err) => {
        delete this.status[source.id]
        delete this.status[source.source_type]

        const toastNotification = new ToastNotification()
        toastNotification.type = ToastType.Error
        toastNotification.message = `An error occurred while deleting source: ${sourceDisplayName}`
        this.toastService.show(toastNotification)
        console.log(err)
      })
  }

  //this is similar to the connectHandler in the MedicalSourcesComponent
  public sourceReconnectHandler(selectedSourceListItem: SourceListItem){

    let sourceType = selectedSourceListItem.metadata.source_type
    this.lighthouseApi.getLighthouseSource(sourceType)
      .then(async (sourceMetadata: LighthouseSourceMetadata) => {
        console.log(sourceMetadata);
        let authorizationUrl = await this.lighthouseApi.generateSourceAuthorizeUrl(sourceType, sourceMetadata, selectedSourceListItem.source.id)

        console.log('authorize url:', authorizationUrl.toString());
        // redirect to lighthouse with uri's (or open a new window in desktop mode)
        this.lighthouseApi.redirectWithOriginAndDestination(authorizationUrl.toString(), sourceType, sourceMetadata.redirect_uri).subscribe((codeData) => {
          //Note: this code will only run in Desktop mode (with popups)
          //in non-desktop environments, the user is redirected in the same window, and this code is never executed.

          //always close the modal
          this.modalService.dismissAll()

          //redirect the browser back to this page with the code in the query string parameters
          this.lighthouseApi.redirectWithDesktopCode(sourceType, codeData)
        })
      });
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
