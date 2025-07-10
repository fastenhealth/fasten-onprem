import { Component, OnInit } from '@angular/core';
import { Source } from 'src/app/models/fasten/source';
import { FastenApiService } from 'src/app/services/fasten-api.service';

@Component({
  selector: 'resource-search-datatable',
  templateUrl: './resource-search-table.component.html',
  styleUrls: ['./resource-search-table.component.scss'],
})
export class ResourceSearchTableComponent implements OnInit {
  loading: boolean = false;

  selectedResourceType: string = null;
  selectedTotalElements: number = 0;
  selectedSource: Source = null;

  resourceTypeCounts: { [name: string]: number } = {};

  constructor(private fastenApi: FastenApiService) {}

  ngOnInit(): void {
    this.loading = true;
    //always request the source summary
    this.fastenApi.getResourceSummary().subscribe(
      (sourceSummary) => {
        this.loading = false;
        console.log('Source Summary:', sourceSummary);
        for (let resourceTypeCount of sourceSummary.resource_type_counts) {
          this.resourceTypeCounts[resourceTypeCount.resource_type] =
            resourceTypeCount.count;
        }
      },
      (error) => {
        this.loading = false;
      }
    );
  }

  selectResourceType(resourceType: string) {
    this.selectedResourceType = resourceType;
    this.selectedTotalElements = this.resourceTypeCounts[resourceType];
  }
}
