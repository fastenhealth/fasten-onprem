import {Component, EventEmitter, OnInit, Optional, Output, ViewChild} from '@angular/core';
import {LighthouseService} from '../../services/lighthouse.service';
import {FastenApiService} from '../../services/fasten-api.service';
import {LighthouseSourceMetadata} from '../../models/lighthouse/lighthouse-source-metadata';
import {Source} from '../../models/fasten/source';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ActivatedRoute} from '@angular/router';
import {environment} from '../../../environments/environment';
import {BehaviorSubject, forkJoin, Observable, of, Subject} from 'rxjs';
import {
  LighthouseSourceSearch,
  LighthouseSourceSearchAggregation,
  LighthouseBrandListDisplayItem
} from '../../models/lighthouse/lighthouse-source-search';
import {debounceTime, distinctUntilChanged, pairwise, startWith} from 'rxjs/operators';
import {MedicalSourcesFilter, MedicalSourcesFilterService} from '../../services/medical-sources-filter.service';
import {FormControl, FormGroup} from '@angular/forms';
import * as _ from 'lodash';
import {PatientAccessBrand} from '../../models/patient-access-brands';
import {PlatformService} from '../../services/platform.service';

export const sourceConnectWindowTimeout = 24*5000 //wait 2 minutes (5 * 24 = 120)

export class SourceListItem {
  source?: Source
  brand: LighthouseBrandListDisplayItem | PatientAccessBrand
  searchHighlights?: string[]
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


  availableLighthouseBrandList: SourceListItem[] = []
  searchTermUpdate = new BehaviorSubject<string>("");
  status: { [name: string]: undefined | "token" | "authorize" } = {}

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
  //TODO: see if we can remove this without breaking search/filtering
  filterForm = this.filterService.filterForm;

  //modal
  modalSelectedBrandListItem: LighthouseBrandListDisplayItem | PatientAccessBrand = null;
  modalCloseResult = '';


  // CCDA-FHIR modal
  @ViewChild('ccdaWarningModalRef') ccdaWarningModalRef : any;

  constructor(
    private lighthouseApi: LighthouseService,
    private fastenApi: FastenApiService,
    private platformApi: PlatformService,
    private activatedRoute: ActivatedRoute,
    private filterService: MedicalSourcesFilterService,
    private modalService: NgbModal,

  ) {
    this.filterService.filterChanges.subscribe((filterInfo) => {

      //this function should only trigger when there's a change to the filter values -- which requires a new query
      this.availableLighthouseBrandList = []
      this.resultLimits.totalItems = 0
      this.resultLimits.scrollComplete = false

      //update the form with data from route (don't emit a new patch event), then submit query
      this.querySources(filterInfo?.filter).subscribe(null, null, () => {})
    })
  }

  ngOnInit(): void {


    // TODO: handle Callbacks from the source connect window
    const callbackState = this.activatedRoute.snapshot.paramMap.get('state')
    if(callbackState){

      //get the source state information from localstorage
      let sourceStateInfo = this.lighthouseApi.getSourceState(callbackState)

      //move this source from available to connected (with a progress bar)
      //remove item from available sources list, add to connected sources.
      let inProgressAvailableIndex = this.availableLighthouseBrandList.findIndex((item) => item.brand.id == sourceStateInfo.brand_id)
      if(inProgressAvailableIndex > -1){
        let sourcesInProgress = this.availableLighthouseBrandList.splice(inProgressAvailableIndex, 1);
      }
    }
    //we're not in a callback redirect, lets load the sources
    if(this.activatedRoute.snapshot.queryParams['query']){
     this.searchTermUpdate.next(this.activatedRoute.snapshot.queryParams['query'])
    }


    //register a callback for when the search box content changes
    this.searchTermUpdate
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
      )
      .subscribe(value => {
        let currentQuery = this.filterService.filterForm.value.query || ""
        if(value != null && currentQuery != value){
          this.filterService.filterForm.patchValue({query: value})
        }
      });

  }

  private querySources(filter?: MedicalSourcesFilter): Observable<LighthouseSourceSearch> {
    if(this.loading){
      return of(null)
    }
    //TODO: pass filter to function.
    // this.location.replaceState('/dashboard','', this.filter)

    if(!filter){
      filter = this.filterService.toMedicalSourcesFilter(this.filterForm.value)
    }


    filter.fields = ["*"];
    this.loading = true
    var searchObservable = this.lighthouseApi.searchLighthouseSources(filter);
    searchObservable.subscribe(wrapper => {
      // this.searchResults = wrapper.hits.hits;
      this.resultLimits.totalItems = wrapper.hits.total.value;

      this.availableLighthouseBrandList = this.availableLighthouseBrandList.concat(wrapper.hits.hits.map((result) => {
        return {
          brand: result._source,
          searchHighlights: result?.highlight?.aliases || []
        }
      }))

      //check if scroll is complete.
      if(!wrapper?.hits || !wrapper?.hits?.hits || wrapper?.hits?.hits?.length == 0 || wrapper?.hits?.total?.value == wrapper?.hits?.hits?.length){
        this.resultLimits.scrollComplete = true;
      } else {
        //change the current Page (but don't cause a new query)
        this.filterService.filterForm.patchValue({searchAfter: wrapper.hits.hits[wrapper.hits.hits.length - 1].sort.join(",")}, {emitEvent: false})
      }

        // .filter((item) => {
        //   return !this.connectedSourceList.find((connectedItem) => connectedItem.metadata.source_type == item.metadata.source_type)
        // }))


        if(wrapper.aggregations){
          this.resultLimits.platformTypesBuckets = wrapper.aggregations.by_platform_type;
          this.resultLimits.categoryBuckets = wrapper.aggregations.by_category;
          var currentCategories = this.filterForm.get('categories').value;
          this.resultLimits.categoryBuckets.buckets.forEach((bucketData) => {
            if(!currentCategories.hasOwnProperty(bucketData.key)){
              (this.filterForm.get('categories') as FormGroup).addControl(bucketData.key, new FormControl(false))
            }
          })

          var currentPlatformTypes = this.filterForm.get('platformTypes').value;
          this.resultLimits.platformTypesBuckets.buckets.forEach((bucketData) => {
            if(!currentPlatformTypes.hasOwnProperty(bucketData.key)){
              (this.filterForm.get('platformTypes') as FormGroup).addControl(bucketData.key, new FormControl(false))
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
        }

        this.loading = false
      },
      error => {
        this.loading = false
        console.error("sources FAILED", error)
      },
      () => {
        this.loading = false
      }
    );
    return searchObservable;
  }


  public onScroll(): void {
    if(!this.resultLimits.scrollComplete) {
      this.querySources()
    }
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


  // /**
  //  * after pressing the logo (connectModalHandler button), this function will display a modal with information about the source
  //  * @param $event
  //  * @param sourceType
  //  */
  public connectModalHandler(contentModalRef, sourceListItem: SourceListItem) :void {
    console.log("TODO: connect Handler")


    this.modalSelectedBrandListItem = sourceListItem.brand
    this.modalService.open(contentModalRef, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.modalSelectedBrandListItem = null
      this.modalCloseResult = `Closed with: ${result}`;
    }, (reason) => {
      this.modalSelectedBrandListItem = null
    });
  }

  // /**
  //  * after pressing the connect button in the Modal, this function will generate an authorize url for this source, and redirect the user.
  //  * @param $event
  //  * @param sourceType
  //  */
  public connectHandler($event, brandId: string, portalId: string, endpointId: string): void {

    ($event.currentTarget as HTMLButtonElement).disabled = true;
    this.status[brandId] = "authorize"
    this.status[endpointId] = "authorize"

    this.lighthouseApi.getLighthouseSource(endpointId)
      .then(async (sourceMetadata: LighthouseSourceMetadata) => {
        sourceMetadata.brand_id = brandId
        sourceMetadata.portal_id = portalId

        let authorizationUrl = await this.lighthouseApi.generateSourceAuthorizeUrl(sourceMetadata)

        // redirect to lighthouse with uri's (or open a new window in desktop mode)
        this.lighthouseApi.redirectWithOriginAndDestination(authorizationUrl.toString(), sourceMetadata).subscribe((desktopRedirectData) => {
          if(!desktopRedirectData){
            return //wait for redirect
          }

          //Note: this code will only run in Desktop mode (with popups)
          //in non-desktop environments, the user is redirected in the same window, and this code is never executed.

          //always close the modal
          this.modalService.dismissAll()

          //redirect the browser back to this page with the code in the query string parameters
          this.lighthouseApi.redirectWithDesktopCode(desktopRedirectData.state, desktopRedirectData.codeData)
        })
      });
  }



  /**
   * this function is used to process manually "uploaded" FHIR bundle files, adding them to the database.
   * @param event
   */
  public async uploadSourceBundleHandler(event) {

    let processingFile = event.addedFiles[0] as File
    this.uploadedFile = [processingFile]

    if(processingFile.type == "text/xml"){

      let shouldConvert = await this.showCcdaWarningModal()
      if(shouldConvert){
        let convertedFile = await this.platformApi.convertCcdaToFhir(processingFile).toPromise()
        processingFile = convertedFile
      } else {
        this.uploadedFile = []
        return
      }

    }

    //TODO: handle manual bundles.
    this.fastenApi.createManualSource(processingFile).subscribe(
      (respData) => {
      },
      (err) => {console.log(err)},
      () => {
        this.uploadedFile = []
      }
    )
  }

  showCcdaWarningModal(): Promise<boolean> {


    return this.modalService.open(this.ccdaWarningModalRef).result.then<boolean>(
      (result) => {
        //convert button clicked, .close()
        return true //convert from CCDA -> FHIR.
      }
    ).catch((reason) => {
      // x or cancel button clicked, .dismiss()
      return false
    })
  }



}
