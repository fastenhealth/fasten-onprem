import {Component, EventEmitter, OnInit, Optional, Output} from '@angular/core';
import {LighthouseService} from '../../services/lighthouse.service';
import {FastenApiService} from '../../services/fasten-api.service';
import {LighthouseSourceMetadata} from '../../models/lighthouse/lighthouse-source-metadata';
import {Source} from '../../models/fasten/source';
import {MetadataSource} from '../../models/fasten/metadata-source';
import {ModalDismissReasons, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ActivatedRoute, Router} from '@angular/router';
import {Location} from '@angular/common';
import {ToastService} from '../../services/toast.service';
import {ToastNotification, ToastType} from '../../models/fasten/toast';
import {environment} from '../../../environments/environment';
import {BehaviorSubject, forkJoin, Observable, Subject} from 'rxjs';
import {
  LighthouseSourceSearch,
  LighthouseSourceSearchAggregation,
  LighthouseSourceSearchResult
} from '../../models/lighthouse/lighthouse-source-search';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {MedicalSourcesFilter, MedicalSourcesFilterService} from '../../services/medical-sources-filter.service';
import {FormControl, FormGroup} from '@angular/forms';
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
  loading: boolean = false

  environment_name = environment.environment_name

  uploadedFile: File[] = []


  availableSourceList: SourceListItem[] = []
  searchTermUpdate = new BehaviorSubject<string>("");
  status: { [name: string]: string } = {}

  //aggregation/filter data & limits
  globalLimits: {
    // aggregations: LighthouseSourceSearchAggregations | undefined,
  } = {
    // categories: [],
    // aggregations: undefined,
  }

  //limits that are tied to the current result set.
  resultLimits: {
    totalItems: number,
    scrollComplete: boolean,
    platformTypesBuckets: LighthouseSourceSearchAggregation,
    categoryBuckets: LighthouseSourceSearchAggregation,
  } = {
    totalItems: 0,
    scrollComplete: false,
    platformTypesBuckets: undefined,
    categoryBuckets: undefined
  }


  //source of truth for current state
  filterForm = this.filterService.filterForm;

  constructor(
    private lighthouseApi: LighthouseService,
    private fastenApi: FastenApiService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private location: Location,
    private toastService: ToastService,
    private filterService: MedicalSourcesFilterService,

  ) { }

  ngOnInit(): void {

    //changing the form, should change the URL, BUT NOT do a query
    this.filterForm.valueChanges.pipe(debounceTime(100)).subscribe(val => {
      console.log("FILTER FORM CHANGED:", val, this.filterService.toQueryParams())

      // change the browser url whenever the filter is updated.
      this.updateBrowserUrl(this.filterService.toQueryParams())
    })

    //TODO: handle Callbacks from the source connect window
    const callbackSourceType = this.activatedRoute.snapshot.paramMap.get('source_type')
    if(callbackSourceType){
      console.error("TODO! handle callback redirect from source")
    } else {
      //we're not in a callback redirect, lets load the sources
      if(this.activatedRoute.snapshot.queryParams['query']){
       this.searchTermUpdate.next(this.activatedRoute.snapshot.queryParams['query'])
      }


      //changing the route should trigger a query
      this.activatedRoute.queryParams
        .subscribe(params => {
          console.log("QUERY PARAMS CHANGED ON ROUTE", params); // {order: "popular"}
          var updatedForm = this.filterService.parseQueryParams(params);

          //this is a "breaking change" to the filter values, causing a reset and a new query
          this.availableSourceList = []
          this.resultLimits.totalItems = 0
          this.resultLimits.scrollComplete = false
          // this.filterService.filterForm.setControl("categories", this.{: {}}, { emitEvent: false})

          //update the form with data from route (don't emit a new patch event), then submit query
          var searchObservable = this.querySources(this.filterService.toMedicalSourcesFilter(updatedForm));
          searchObservable.subscribe(null, null, () => {
            this.filterForm.patchValue(updatedForm, { emitEvent: false});
          })
        });
    }




    /// OLD CODE - Should be refactored




    // this.loading = true
    // forkJoin([this.lighthouseApi.findLighthouseSources("", "", this.showHidden), this.fastenApi.getSources()]).subscribe(results => {
    //   this.loading = false
    //
    //   //handle connected sources sources
    //   const connectedSources = results[1] as Source[]
    //   forkJoin(connectedSources.map((source) => this.lighthouseApi.getLighthouseSource(source.source_type))).subscribe((connectedMetadata) => {
    //     for(const ndx in connectedSources){
    //       this.connectedSourceList.push({source: connectedSources[ndx], metadata: connectedMetadata[ndx]})
    //     }
    //   })
    //
    //
    //   //handle source metadata map response
    //   this.populateAvailableSourceList(results[0] as LighthouseSourceSearch)
    //
    //
    //   //check if we've just started connecting a "source_type"
    //   const callbackSourceType = this.route.snapshot.paramMap.get('source_type')
    //   if(callbackSourceType){
    //     this.status[callbackSourceType] = "token"
    //
    //     //move this source from available to connected (with a progress bar)
    //     //remove item from available sources list, add to connected sources.
    //     let inProgressAvailableIndex = this.availableSourceList.findIndex((item) => item.metadata.source_type == callbackSourceType)
    //     if(inProgressAvailableIndex > -1){
    //       let sourcesInProgress = this.availableSourceList.splice(inProgressAvailableIndex, 1);
    //
    //     }
    //
    //     //the structure of "availableSourceList" vs "connectedSourceList" sources is slightly different,
    //     //connectedSourceList contains a "source" field. The this.fastenApi.createSource() call in the callback function will set it.
    //     this.lighthouseApi.getLighthouseSource(callbackSourceType)
    //       .then((metadata) => {
    //         this.connectedSourceList.push({metadata: metadata})
    //         return this.callback(callbackSourceType)
    //       })
    //       .then(console.log)
    //   }
    //
    // }, err => {
    //   this.loading = false
    // })
    //
    //
    //register a callback for when the search box content changes
    this.searchTermUpdate
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
      )
      .subscribe(value => {
        console.log("search term changed:", value)
        let currentQuery = this.filterService.filterForm.value.query || ""
        if(value != null && currentQuery != value){
          this.filterService.filterForm.patchValue({query: value})
        }
      });

  }

  updateBrowserUrl(queryParams: {[name: string]: string}){
    console.log("update the browser url with query params data", queryParams)
    this.router.navigate(['/sources'], { queryParams: queryParams })
  }

  private querySources(filter?: MedicalSourcesFilter): Observable<LighthouseSourceSearch> {
    if(this.loading){
      return
    }
    //TODO: pass filter to function.
    // this.location.replaceState('/dashboard','', this.filter)

    if(!filter){
      filter = this.filterService.toMedicalSourcesFilter(this.filterForm.value)
      console.log("querySources() - no filter provided, using current form value", filter)
    }


    filter.fields = ["*"];
    this.loading = true
    var searchObservable = this.lighthouseApi.searchLighthouseSources(filter);
    searchObservable.subscribe(wrapper => {
      console.log("search sources", wrapper);
      // this.searchResults = wrapper.hits.hits;
      this.resultLimits.totalItems = wrapper.hits.total.value;

      this.availableSourceList = this.availableSourceList.concat(wrapper.hits.hits.map((result) => {
        return {metadata: result._source}
      }))

      //change the current Page (but don't cause a new query)
      if(wrapper.hits.hits.length == 0){
        console.log("SCROLL_COMPLETE!@@@@@@@@")
        this.resultLimits.scrollComplete = true;
      } else {
        console.log("SETTING NEXT SORT KEY:", wrapper.hits.hits[wrapper.hits.hits.length - 1].sort.join(','))
        this.filterService.filterForm.patchValue({searchAfter: wrapper.hits.hits[wrapper.hits.hits.length - 1].sort.join(",")}, {emitEvent: false})
      }

        // .filter((item) => {
        //   return !this.connectedSourceList.find((connectedItem) => connectedItem.metadata.source_type == item.metadata.source_type)
        // }))



        this.resultLimits.platformTypesBuckets = wrapper.aggregations.by_platform_type;
        this.resultLimits.categoryBuckets = wrapper.aggregations.by_category;



        var currentCategories = this.filterForm.get('categories').value;
        this.resultLimits.categoryBuckets.buckets.forEach((bucketData) => {
          if(!currentCategories.hasOwnProperty(bucketData.key)){
            (this.filterForm.get('categories') as FormGroup).addControl(bucketData.key, new FormControl(false))
          }
        })
        //
        // this.resultLimits.categoryBuckets.forEach((bucketData) => {
        //   if(!this.globalLimits.categories.some((category) => { return category.id === bucketData.key})){
        //     this.globalLimits.categories.push({
        //       id: bucketData.key,
        //       name: bucketData.key,
        //       group: 'custom'
        //     })
        //   }
        // })

        // const fileTypes = <FormGroup>this.filterForm.get('fileTypes');
        // fileTypes.forEach((option: any) => {
        //   checkboxes.addControl(option.title, new FormControl(true));
        // });
        this.loading = false
      },
      error => {
        this.loading = false
        console.error("sources FAILED", error)
      },
      () => {
        this.loading = false
        console.log("sources finished")
      }
    );
    return searchObservable;
  }


  //OLD FUNCTIONS
  //
  //
  // private populateAvailableSourceList(results: LighthouseSourceSearch): void {
  //   console.log("AGGREGATIONS!!!!!", results.aggregations)
  //   this.totalAvailableSourceList = results.hits.total.value
  //   if(results.hits.hits.length == 0){
  //     this.scrollComplete = true
  //     console.log("scroll complete")
  //     return
  //   }
  //   this.scrollId = results._scroll_id
  //   this.availableSourceList = this.availableSourceList.concat(results.hits.hits.map((result) => {
  //     return {metadata: result._source}
  //   }).filter((item) => {
  //     return !this.connectedSourceList.find((connectedItem) => connectedItem.metadata.source_type == item.metadata.source_type)
  //   }))
  // }
  //
  public onScroll(): void {
    console.log("TODO: SCROLL, TRIGGER update")
    this.querySources()
  }

  // /**
  //  * after pressing the logo (connectHandler button), this function will generate an authorize url for this source, and redirec the user.
  //  * @param $event
  //  * @param sourceType
  //  */
  public connectHandler($event: MouseEvent, sourceType: string):void {
    console.log("TODO: connect Handler")
  //   ($event.currentTarget as HTMLButtonElement).disabled = true;
  //   this.status[sourceType] = "authorize"
  //
  //   this.lighthouseApi.getLighthouseSource(sourceType)
  //     .then(async (sourceMetadata: LighthouseSourceMetadata) => {
  //       console.log(sourceMetadata);
  //       let authorizationUrl = await this.lighthouseApi.generateSourceAuthorizeUrl(sourceType, sourceMetadata)
  //
  //       console.log('authorize url:', authorizationUrl.toString());
  //       // redirect to lighthouse with uri's
  //       this.lighthouseApi.redirectWithOriginAndDestination(authorizationUrl.toString(), sourceType, sourceMetadata.redirect_uri)
  //
  //     });
  }
  //
  // /**
  //  * if the user is redirected to this page from the lighthouse, we'll need to process the "code" to retrieve the access token & refresh token.
  //  * @param sourceType
  //  */
  // public async callback(sourceType: string) {
  //
  //   //get the source metadata again
  //   await this.lighthouseApi.getLighthouseSource(sourceType)
  //     .then(async (sourceMetadata: LighthouseSourceMetadata) => {
  //
  //       //get required parameters from the URI and local storage
  //       const callbackUrlParts = new URL(window.location.href)
  //       const fragmentParams = new URLSearchParams(callbackUrlParts.hash.substring(1))
  //       const callbackCode = callbackUrlParts.searchParams.get("code") || fragmentParams.get("code")
  //       const callbackState = callbackUrlParts.searchParams.get("state") || fragmentParams.get("state")
  //       const callbackError = callbackUrlParts.searchParams.get("error") || fragmentParams.get("error")
  //       const callbackErrorDescription = callbackUrlParts.searchParams.get("error_description") || fragmentParams.get("error_description")
  //
  //       //reset the url, removing the params and fragment from the current url.
  //       const urlTree = this.router.createUrlTree(["/sources"],{
  //         relativeTo: this.route,
  //       });
  //       this.location.replaceState(urlTree.toString());
  //
  //       const expectedSourceStateInfo = JSON.parse(localStorage.getItem(callbackState))
  //       localStorage.removeItem(callbackState)
  //
  //       if(callbackError && !callbackCode){
  //         //TOOD: print this message in the UI
  //         let errMsg = "an error occurred while authenticating to this source. Please try again later"
  //         console.error(errMsg, callbackErrorDescription)
  //         throw new Error(errMsg)
  //       }
  //
  //       console.log("callback code:", callbackCode)
  //       this.status[sourceType] = "token"
  //
  //       let payload: any
  //       payload = await this.lighthouseApi.swapOauthToken(sourceType, sourceMetadata,expectedSourceStateInfo, callbackCode)
  //
  //       if(!payload.access_token || payload.error){
  //         //if the access token is not set, then something is wrong,
  //         let errMsg = payload.error || "unable to retrieve access_token"
  //         console.error(errMsg)
  //         throw new Error(errMsg)
  //       }
  //
  //       //If payload.patient is not set, make sure we extract the patient ID from the id_token or make an introspection req
  //       if(!payload.patient && payload.id_token){
  //         //
  //         console.log("NO PATIENT ID present, decoding jwt to extract patient")
  //         //const introspectionResp = await Oauth.introspectionRequest(as, client, payload.access_token)
  //         //console.log(introspectionResp)
  //         let decodedIdToken = this.jwtDecode(payload.id_token)
  //         //nextGen uses fhirUser instead of profile.
  //         payload.patient = decodedIdToken["profile"] || decodedIdToken["fhirUser"]
  //
  //         if(payload.patient){
  //           payload.patient = payload.patient.replace(/^(Patient\/)/,'')
  //         }
  //
  //       }
  //
  //
  //
  //       //Create FHIR Client
  //
  //       const dbSourceCredential = new Source({
  //         source_type: sourceType,
  //
  //         authorization_endpoint: sourceMetadata.authorization_endpoint,
  //         token_endpoint: sourceMetadata.token_endpoint,
  //         introspection_endpoint: sourceMetadata.introspection_endpoint,
  //         userinfo_endpoint: sourceMetadata.userinfo_endpoint,
  //         api_endpoint_base_url:   sourceMetadata.api_endpoint_base_url,
  //         client_id:             sourceMetadata.client_id,
  //         redirect_uri:          sourceMetadata.redirect_uri,
  //         scopes_supported:      sourceMetadata.scopes_supported,
  //         issuer: sourceMetadata.issuer,
  //         grant_types_supported: sourceMetadata.grant_types_supported,
  //         response_types_supported: sourceMetadata.response_types_supported,
  //         aud: sourceMetadata.aud,
  //         code_challenge_methods_supported: sourceMetadata.code_challenge_methods_supported,
  //         confidential: sourceMetadata.confidential,
  //         cors_relay_required: sourceMetadata.cors_relay_required,
  //
  //         patient:            payload.patient,
  //         access_token:          payload.access_token,
  //         refresh_token:          payload.refresh_token,
  //         id_token:              payload.id_token,
  //
  //         // @ts-ignore - in some cases the getAccessTokenExpiration is a string, which cases failures to store Source in db.
  //         expires_at:            parseInt(this.getAccessTokenExpiration(payload)),
  //       })
  //
  //       this.fastenApi.createSource(dbSourceCredential)
  //         .subscribe((resp) => {
  //           // const sourceSyncMessage = JSON.parse(msg) as SourceSyncMessage
  //           delete this.status[sourceType]
  //           // window.location.reload();
  //           // this.connectedSourceList.
  //
  //           //find the index of the "inprogress" source in the connected List, and then add this source to its source metadata.
  //           let foundSource = this.connectedSourceList.findIndex((item) => item.metadata.source_type == sourceType)
  //           this.connectedSourceList[foundSource].source = resp.source
  //
  //           console.log("source sync-all response:", resp.summary)
  //
  //           const toastNotification = new ToastNotification()
  //           toastNotification.type = ToastType.Success
  //           toastNotification.message = `Successfully connected ${sourceType}`
  //
  //           // const upsertSummary = sourceSyncMessage.response as UpsertSummary
  //           // if(upsertSummary && upsertSummary.totalResources != upsertSummary.updatedResources.length){
  //           //   toastNotification.message += `\n (total: ${upsertSummary.totalResources}, updated: ${upsertSummary.updatedResources.length})`
  //           // } else if(upsertSummary){
  //           //   toastNotification.message += `\n (total: ${upsertSummary.totalResources})`
  //           // }
  //
  //           this.toastService.show(toastNotification)
  //         },
  //         (err) => {
  //           delete this.status[sourceType]
  //           // window.location.reload();
  //
  //           const toastNotification = new ToastNotification()
  //           toastNotification.type = ToastType.Error
  //           toastNotification.message = `An error occurred while accessing ${sourceType}: ${err}`
  //           toastNotification.autohide = false
  //           this.toastService.show(toastNotification)
  //           console.error(err)
  //         });
  //     })
  //     .catch((err) => {
  //       delete this.status[sourceType]
  //       // window.location.reload();
  //
  //       const toastNotification = new ToastNotification()
  //       toastNotification.type = ToastType.Error
  //       toastNotification.message = `An error occurred while accessing ${sourceType}: ${err}`
  //       toastNotification.autohide = false
  //       this.toastService.show(toastNotification)
  //       console.error(err)
  //     })
  // }


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




  ///////////////////////////////////////////////////////////////////////////////////////
  // Private
  ///////////////////////////////////////////////////////////////////////////////////////




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
  private getAccessTokenExpiration(tokenResponse: any): number
  {
    const now = Math.floor(Date.now() / 1000);

    // Option 1 - using the expires_in property of the token response
    if (tokenResponse.expires_in) {
      return now + tokenResponse.expires_in;
    }

    // Option 2 - using the exp property of JWT tokens (must not assume JWT!)
    if (tokenResponse.access_token) {
      let tokenBody = this.jwtDecode(tokenResponse.access_token);
      if (tokenBody && tokenBody['exp']) {
        return tokenBody['exp'];
      }
    }

    // Option 3 - if none of the above worked set this to 5 minutes after now
    return now + 300;
  }

}
