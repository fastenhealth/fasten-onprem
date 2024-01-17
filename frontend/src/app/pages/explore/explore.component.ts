import { Component, OnInit } from '@angular/core';
import {FastenApiService} from '../../services/fasten-api.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Source} from '../../models/fasten/source';
import {forkJoin} from 'rxjs';
import {LighthouseService} from '../../services/lighthouse.service';
import {Router} from '@angular/router';
import {LighthouseBrandListDisplayItem} from '../../models/lighthouse/lighthouse-source-search';
import {LighthouseSourceMetadata} from '../../models/lighthouse/lighthouse-source-metadata';

export class SourceListItem {
  source?: Source
  metadata: LighthouseSourceMetadata
}

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
      forkJoin(connectedSources.map((source) => this.lighthouseApi.getLighthouseSource(source.endpoint_id))).subscribe((connectedMetadata) => {
        for(const ndx in connectedSources){
          this.connectedSources.push({source: connectedSources[ndx], metadata: connectedMetadata[ndx]})
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
