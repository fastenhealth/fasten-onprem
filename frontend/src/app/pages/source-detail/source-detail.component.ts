import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Source} from '../../models/fasten/source';
import {FastenApiService} from '../../services/fasten-api.service';
import {ResourceListOutletDirective} from '../../directive/resource-list-outlet.directive';


@Component({
  selector: 'app-source-detail',
  templateUrl: './source-detail.component.html',
  styleUrls: ['./source-detail.component.scss']
})
export class SourceDetailComponent implements OnInit {

  selectedSource: Source = null
  selectedResourceType: string = null

  resourceTypeCounts: { [name: string]: number } = {}

  constructor(private fastenApi: FastenApiService, private router: Router, private route: ActivatedRoute) {
    //check if the current Source was sent over using the router state storage:
    if(this.router.getCurrentNavigation().extras.state){
      this.selectedSource = this.router.getCurrentNavigation().extras.state as Source
    }
  }

  ngOnInit(): void {
    //always request the source summary
    this.fastenApi.getSourceSummary(this.route.snapshot.paramMap.get('source_id')).subscribe((sourceSummary) => {
      this.selectedSource = sourceSummary.source;
      for(let resourceTypeCount of sourceSummary.resource_type_counts){
        this.resourceTypeCounts[resourceTypeCount.resource_type] = resourceTypeCount.count
      }
    });
  }

  selectResourceType(resourceType: string) {
    this.selectedResourceType = resourceType
  }
}
