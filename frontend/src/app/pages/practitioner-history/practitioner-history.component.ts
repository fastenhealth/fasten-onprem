import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Practitioner } from 'src/app/models/fasten/practitioner';
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
  practitioner: Practitioner | null = null;

  constructor(
    public fastenApi: FastenApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Initialize the practitioner from the route state if available
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.practitioner = navigation.extras.state['practitioner'] || null;
    }
  }

  ngOnInit(): void {
    this.loading = true;

    this.route.params.subscribe((params) => {
      this.practitionerId = params['id'];

      if (this.practitionerId) {
        this.fastenApi
          .getPractitionerHistory(this.practitionerId)
          .subscribe((response: ResourceFhir[]) => {
            if (!response?.length) {
              this.loading = false;
              console.warn('No encounters found for this practitioner');
              return;
            }

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
    const encounterIds = this.allEncountersIds.slice(
      (this.currentPage - 1) * this.pageSize,
      this.currentPage * this.pageSize
    );

    this.fastenApi.getResourceGraph(null, encounterIds).subscribe(
      (graphResponse: ResourceGraphResponse) => {

        this.encounters = graphResponse.results['Encounter'] || [];
        this.loading = false;
      },
      (error) => {
        console.error('Error fetching resource graph:', error);
        this.loading = false;
      }
    );
  }
}
