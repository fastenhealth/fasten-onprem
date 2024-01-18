import { Component, OnInit } from '@angular/core';
import {FastenApiService} from '../../services/fasten-api.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Source} from '../../models/fasten/source';
import {forkJoin, of} from 'rxjs';
import {LighthouseService} from '../../services/lighthouse.service';
import {Router} from '@angular/router';
import {LighthouseBrandListDisplayItem} from '../../models/lighthouse/lighthouse-source-search';
import {LighthouseSourceMetadata} from '../../models/lighthouse/lighthouse-source-metadata';
import {SourceListItem} from '../medical-sources/medical-sources.component';


@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent implements OnInit {
  loading: boolean = false
  connectedSources: SourceListItem[] = []
  constructor(
    private fastenApi: FastenApiService,
    private lighthouseApi: LighthouseService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loading = true
    this.fastenApi.getSources().subscribe(results => {

      //handle connected sources sources
      const connectedSources = results as Source[]
      forkJoin(connectedSources.map((source) => {
        //TODO: remove this, and similar code in medical-sources-card.component.ts
        if(source.platform_type == 'fasten' || source.platform_type == 'manual') {
          return this.lighthouseApi.getLighthouseCatalogBrand(source.platform_type)
        } else {
          return of(null)
        }
      })).subscribe((connectedMetadata) => {
          for(const ndx in connectedSources){
            this.connectedSources.push({source: connectedSources[ndx], brand: connectedMetadata[ndx]})
          }
          this.loading = false
        })
      if(connectedSources.length == 0) this.loading = false

    }, error => {
      this.loading = false
    })

  }

  public exploreSource(sourceListItem: SourceListItem, ) {
    this.router.navigateByUrl(`/explore/${sourceListItem.source.id}`, {
      state: sourceListItem.source
    });

  }

}
