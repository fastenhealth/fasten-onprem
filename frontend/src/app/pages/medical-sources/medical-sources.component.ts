import {Component, EventEmitter, OnInit, Optional, Output} from '@angular/core';
import {LighthouseService} from '../../services/lighthouse.service';
import {FastenApiService} from '../../services/fasten-api.service';
import {LighthouseSourceMetadata} from '../../models/lighthouse/lighthouse-source-metadata';
import {Source} from '../../models/fasten/source';
import {MetadataSource} from '../../models/fasten/metadata-source';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ActivatedRoute} from '@angular/router';
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
  modalSelectedSourceListItem:SourceListItem = null;
  modalCloseResult = '';

  constructor(
    private lighthouseApi: LighthouseService,
    private fastenApi: FastenApiService,
    private activatedRoute: ActivatedRoute,
    private filterService: MedicalSourcesFilterService,
    private modalService: NgbModal,
  ) { }

  ngOnInit(): void {


    //TODO: handle Callbacks from the source connect window
    const callbackSourceType = this.activatedRoute.snapshot.paramMap.get('source_type')
    if(callbackSourceType){
      //move this source from available to connected (with a progress bar)
      //remove item from available sources list, add to connected sources.
      let inProgressAvailableIndex = this.availableSourceList.findIndex((item) => item.metadata.source_type == callbackSourceType)
      if(inProgressAvailableIndex > -1){
        let sourcesInProgress = this.availableSourceList.splice(inProgressAvailableIndex, 1);
      }

    }
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
        this.filterService.resetControl("categories")
        // this.filterService.filterForm.setControl("categories", this.{: {}}, { emitEvent: false})

        //update the form with data from route (don't emit a new patch event), then submit query
        var searchObservable = this.querySources(this.filterService.toMedicalSourcesFilter(updatedForm));
        searchObservable.subscribe(null, null, () => {
          this.filterForm.patchValue(updatedForm, { emitEvent: false});
        })
      });

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
      if(!wrapper?.hits || !wrapper?.hits || wrapper?.hits?.hits?.length == 0){
        console.log("SCROLL_COMPLETE!@@@@@@@@")
        this.resultLimits.scrollComplete = true;
      } else {
        console.log("SETTING NEXT SORT KEY:", wrapper.hits.hits[wrapper.hits.hits.length - 1].sort.join(','))
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
        console.log("sources finished")
      }
    );
    return searchObservable;
  }


  public onScroll(): void {
    this.querySources()
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


    this.modalSelectedSourceListItem = sourceListItem
    this.modalService.open(contentModalRef, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.modalSelectedSourceListItem = null
      this.modalCloseResult = `Closed with: ${result}`;
    }, (reason) => {
      this.modalSelectedSourceListItem = null
    });
  }

  // /**
  //  * after pressing the connect button in the Modal, this function will generate an authorize url for this source, and redirec the user.
  //  * @param $event
  //  * @param sourceType
  //  */
  public connectHandler($event, sourceListItem: SourceListItem): void {

    ($event.currentTarget as HTMLButtonElement).disabled = true;
    this.status[sourceListItem.metadata.source_type] = "authorize"

    let sourceType = sourceListItem.metadata.source_type
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



}
