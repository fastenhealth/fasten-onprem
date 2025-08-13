import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ResourceGraphResponse } from 'src/app/models/fasten/resource-graph-response';
import { ResourceFhir } from 'src/app/models/fasten/resource_fhir';
import { FastenApiService } from 'src/app/services/fasten-api.service';

@Component({
  selector: 'app-practitioner-history',
  templateUrl: './practitioner-history.component.html',
  styleUrls: ['./practitioner-history.component.scss'],
})
export class PractitionerHistoryComponent implements OnInit {
  loading: boolean = false;

  currentPage: number = 1; // 1-based index due to the way the pagination component works
  pageSize: number = 10;

  allEncountersIds: any[] = [];
  encounters: ResourceFhir[] = [];
  practitionerId: string | null = null;

  constructor(
    public fastenApi: FastenApiService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    //load the first page
    this.loading = true;

    this.route.params.subscribe((params) => {
      this.practitionerId = params['id'];

      if (this.practitionerId) {
        this.fastenApi
          .getPractitionerHistory(this.practitionerId)
          .subscribe((response: ResourceFhir[]) => {
            this.allEncountersIds = response.map(
              (resource: ResourceFhir): Partial<ResourceFhir> => {
                return {
                  source_id: resource.source_id,
                  source_resource_type: resource.source_resource_type,
                  source_resource_id: resource.source_resource_id,
                };
              }
            );

            this.pageChange();
            this.loading = false;
          });
      } else {
        this.loading = false;
        console.error('No practitioner ID in route params');
      }
    });
  }

  pageChange() {
    this.loading = true;

    const encounterIds = this.allEncountersIds.slice(
      (this.currentPage - 1) * this.pageSize,
      this.currentPage * this.pageSize
    );

    this.fastenApi.getResourceGraph(null, encounterIds).subscribe(
      (graphResponse: ResourceGraphResponse) => {
        this.loading = false;

        this.encounters = graphResponse.results['Encounter'] || [];
      },
      (error) => {
        this.loading = false;
      }
    );
  }
}
