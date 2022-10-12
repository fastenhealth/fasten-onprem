import {Component, OnInit} from '@angular/core';
import {LighthouseService} from '../../services/lighthouse.service';
import {FastenApiService} from '../../services/fasten-api.service';
import {FastenDbService} from '../../services/fasten-db.service';
import {LighthouseSourceMetadata} from '../../../lib/models/lighthouse/lighthouse-source-metadata';
import {Source} from '../../../lib/models/database/source';
import {getAccessTokenExpiration, jwtDecode} from 'fhirclient/lib/lib';
import BrowserAdapter from 'fhirclient/lib/adapters/BrowserAdapter';
import {MetadataSource} from '../../models/fasten/metadata-source';
import {ModalDismissReasons, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ActivatedRoute, Router} from '@angular/router';
import {Location} from '@angular/common';
import {SourceType} from '../../../lib/models/database/source_types';
import {QueueService} from '../../workers/queue.service';
import {ToastService} from '../../services/toast.service';
import {ToastNotification, ToastType} from '../../models/fasten/toast';
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
    private fastenDb: FastenDbService,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private queueService: QueueService,
    private toastService: ToastService
  ) { }
  status: { [name: string]: string } = {}

  metadataSources: {[name:string]: MetadataSource} = {}

  connectedSourceList: SourceListItem[] = [] //source's are populated for this list
  availableSourceList: SourceListItem[] = []

  uploadedFile: File[] = []

  closeResult = '';
  modalSelectedSourceListItem:SourceListItem = null;

  ngOnInit(): void {
    this.fastenApi.GetMetadataSources().subscribe((metadataSources: {[name:string]: MetadataSource}) => {
      this.metadataSources = metadataSources

      const callbackSourceType = this.route.snapshot.paramMap.get('source_type')
      if(callbackSourceType){
        this.callback(callbackSourceType).then(console.log)
      }

      this.fastenDb.GetSources()
        .then((paginatedList) => {
          const sourceList = paginatedList.rows as Source[]

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
        this.lighthouseApi.redirectWithOriginAndDestination(authorizationUrl.toString(), sourceType)

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

        const dbSourceCredential = new Source({
          source_type: sourceType as SourceType,

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

        await this.fastenDb.CreateSource(dbSourceCredential).then(console.log)
        this.queueSourceSyncWorker(sourceType as SourceType, dbSourceCredential)

      })
  }


  /**
   * this function is used to process manually "uploaded" FHIR bundle files, adding them to the database.
   * @param event
   */
  public uploadSourceBundleHandler(event) {
    this.uploadedFile = [event.addedFiles[0]]
    //TODO: handle manual bundles.
    // this.fastenDb.CreateManualSource(event.addedFiles[0]).subscribe(
    //   (respData) => {
    //     console.log("source manual source create response:", respData)
    //   },
    //   (err) => {console.log(err)},
    //   () => {
    //     this.uploadedFile = []
    //   }
    // )
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

    this.queueSourceSyncWorker(source.source_type as SourceType, source)
  }


  ///////////////////////////////////////////////////////////////////////////////////////
  // Private
  ///////////////////////////////////////////////////////////////////////////////////////
  private queueSourceSyncWorker(sourceType: SourceType, source: Source){
    //this work is pushed to the Sync Worker.
    //TODO: if the user closes the browser the data update may not complete. we should set a status flag when "starting" sync, and then remove it when compelte
    // so that we can show incompelte statuses
    this.queueService.runSourceSyncWorker(source)
      .subscribe((msg) => {
          const sourceSyncMessage = JSON.parse(msg)
          delete this.status[sourceType]
          // window.location.reload();

          console.log("source sync-all response:", sourceSyncMessage)
          //remove item from available sources list, add to connected sources.
          this.availableSourceList.splice(this.availableSourceList.findIndex((item) => item.metadata.source_type == sourceType), 1);
          this.connectedSourceList.push({source: sourceSyncMessage.source, metadata: this.metadataSources[sourceType]})

          const toastNotificaiton = new ToastNotification()
          toastNotificaiton.type = ToastType.Success
          toastNotificaiton.message = `Successfully connected ${sourceType}`
          this.toastService.show(toastNotificaiton)
        },
        (err) => {
          delete this.status[sourceType]
          // window.location.reload();

          const toastNotificaiton = new ToastNotification()
          toastNotificaiton.type = ToastType.Error
          toastNotificaiton.message = `An error occurred while accessing ${sourceType}: ${err}`
          toastNotificaiton.autohide = false
          this.toastService.show(toastNotificaiton)
          console.error(err)
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
