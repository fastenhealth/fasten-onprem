import {Component, OnInit} from '@angular/core';
import {LighthouseService} from '../../services/lighthouse.service';
import {FastenApiService} from '../../services/fasten-api.service';
import {LighthouseSourceMetadata} from '../../models/lighthouse/lighthouse-source-metadata';
import {Source} from '../../models/fasten/source';
import {getAccessTokenExpiration, jwtDecode} from 'fhirclient/lib/lib';
import BrowserAdapter from 'fhirclient/lib/adapters/BrowserAdapter';
import {MetadataSource} from '../../models/fasten/metadata-source';
import {ModalDismissReasons, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ActivatedRoute, Router} from '@angular/router';
import {Location} from '@angular/common';
import {ToastService} from '../../services/toast.service';
import {ToastNotification, ToastType} from '../../models/fasten/toast';
import {environment} from '../../../environments/environment';
// If you dont import this angular will import the wrong "Location"

export const sourceConnectWindowTimeout = 24*5000 //wait 2 minutes (5 * 24 = 120)

export class SourceListItem {
  source?: Source
  metadata: MetadataSource
}


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
    private toastService: ToastService
  ) { }


  environment_name = environment.environment_name
  status: { [name: string]: string } = {}

  metadataSources: {[name:string]: MetadataSource} = {}

  connectedSourceList: SourceListItem[] = [] //source's are populated for this list
  availableSourceList: SourceListItem[] = []

  uploadedFile: File[] = []

  closeResult = '';
  modalSelectedSourceListItem:SourceListItem = null;

  ngOnInit(): void {
    this.lighthouseApi.getLighthouseSourceMetadataMap().subscribe((metadataSources: {[name:string]: MetadataSource}) => {
      this.metadataSources = metadataSources

      const callbackSourceType = this.route.snapshot.paramMap.get('source_type')
      if(callbackSourceType){
        this.callback(callbackSourceType).then(console.log)
      }

      this.fastenApi.getSources()
        .subscribe((paginatedList: Source[]) => {
          const sourceList = paginatedList as Source[]

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
              this.availableSourceList.push({metadata: this.metadataSources[sourceType]})
            }
          }

        })
    })


  }

  /**
   * after pressing the logo (connectHandler button), this function will generate an authorize url for this source, and redirec the user.
   * @param $event
   * @param sourceType
   */
  public connectHandler($event: MouseEvent, sourceType: string):void {
    ($event.currentTarget as HTMLButtonElement).disabled = true;
    this.status[sourceType] = "authorize"

    this.lighthouseApi.getLighthouseSource(sourceType)
      .then(async (sourceMetadata: LighthouseSourceMetadata) => {
        console.log(sourceMetadata);
        let authorizationUrl = await this.lighthouseApi.generateSourceAuthorizeUrl(sourceType, sourceMetadata)

        console.log('authorize url:', authorizationUrl.toString());
        // redirect to lighthouse with uri's
        this.lighthouseApi.redirectWithOriginAndDestination(authorizationUrl.toString(), sourceType, sourceMetadata.redirect_uri)

      });
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

        const expectedSourceStateInfo = JSON.parse(localStorage.getItem(callbackState))
        localStorage.removeItem(callbackState)

        if(callbackError && !callbackCode){
          //TOOD: print this message in the UI
          console.error("an error occurred while authenticating to this source. Please try again later", callbackErrorDescription)
          return
        }

        console.log("callback code:", callbackCode)
        this.status[sourceType] = "token"

        let payload: any
        payload = await this.lighthouseApi.swapOauthToken(sourceType, sourceMetadata,expectedSourceStateInfo, callbackCode)


        //If payload.patient is not set, make sure we extract the patient ID from the id_token or make an introspection req
        if(!payload.patient && payload.id_token){
          //
          console.log("NO PATIENT ID present, decoding jwt to extract patient")
          //const introspectionResp = await Oauth.introspectionRequest(as, client, payload.access_token)
          //console.log(introspectionResp)
          payload.patient = jwtDecode(payload.id_token, new BrowserAdapter())["profile"].replace(/^(Patient\/)/,'')
        }



        //Create FHIR Client

        const dbSourceCredential = new Source({
          source_type: sourceType,

          authorization_endpoint: sourceMetadata.authorization_endpoint,
          token_endpoint: sourceMetadata.token_endpoint,
          introspection_endpoint: sourceMetadata.introspection_endpoint,
          userinfo_endpoint: sourceMetadata.userinfo_endpoint,
          api_endpoint_base_url:   sourceMetadata.api_endpoint_base_url,
          client_id:             sourceMetadata.client_id,
          redirect_uri:          sourceMetadata.redirect_uri,
          scopes_supported:      sourceMetadata.scopes_supported,
          issuer: sourceMetadata.issuer,
          grant_types_supported: sourceMetadata.grant_types_supported,
          response_types_supported: sourceMetadata.response_types_supported,
          aud: sourceMetadata.aud,
          code_challenge_methods_supported: sourceMetadata.code_challenge_methods_supported,
          confidential: sourceMetadata.confidential,
          cors_relay_required: sourceMetadata.cors_relay_required,

          patient:            payload.patient,
          access_token:          payload.access_token,
          refresh_token:          payload.refresh_token,
          id_token:              payload.id_token,

          // @ts-ignore - in some cases the getAccessTokenExpiration is a string, which cases failures to store Source in db.
          expires_at:            parseInt(getAccessTokenExpiration(payload, new BrowserAdapter())),
        })

        this.fastenApi.createSource(dbSourceCredential)
          .subscribe((msg) => {
            // const sourceSyncMessage = JSON.parse(msg) as SourceSyncMessage
            delete this.status[sourceType]
            // window.location.reload();

            console.log("source sync-all response:", msg)
            //remove item from available sources list, add to connected sources.
            this.availableSourceList.splice(this.availableSourceList.findIndex((item) => item.metadata.source_type == sourceType), 1);
            if(this.connectedSourceList.findIndex((item) => item.metadata.source_type == sourceType) == -1){
              //only add this as a connected source if its "new"
              this.connectedSourceList.push({source: msg, metadata: this.metadataSources[sourceType]})
            }

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
            toastNotification.message = `An error occurred while accessing ${sourceType}: ${err}`
            toastNotification.autohide = false
            this.toastService.show(toastNotification)
            console.error(err)
          });
      })
  }


  /**
   * this function is used to process manually "uploaded" FHIR bundle files, adding them to the database.
   * @param event
   */
  public uploadSourceBundleHandler(event) {
    this.uploadedFile = [event.addedFiles[0]]
    //TODO: handle manual bundles.
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

  public openModal(contentModalRef, sourceListItem: SourceListItem) {
    this.modalSelectedSourceListItem = sourceListItem
    this.modalService.open(contentModalRef, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.modalSelectedSourceListItem = null
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.modalSelectedSourceListItem = null
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  public sourceSyncHandler(source: Source){
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


  ///////////////////////////////////////////////////////////////////////////////////////
  // Private
  ///////////////////////////////////////////////////////////////////////////////////////

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
