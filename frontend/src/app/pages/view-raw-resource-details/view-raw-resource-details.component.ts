import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FastenDisplayModel } from 'src/lib/models/fasten/fasten-display-model';
import { FastenApiService } from 'src/app/services/fasten-api.service';
import { TypesenseDocument } from 'src/app/models/typesense/typesense-result-model';
import { fhirModelFactory } from 'src/lib/public-api';
import { ResourceType } from 'src/lib/models/constants';

@Component({
  selector: 'app-view-raw-resource-details',
  templateUrl: './view-raw-resource-details.component.html',
  styleUrls: ['./view-raw-resource-details.component.scss'],
})
export class ViewRawResourceDetailsComponent implements OnInit {
  debugMode = false;
  loading: boolean = false;

  sourceId: string = '';
  sourceName: string = '';
  resource: TypesenseDocument = null;
  displayModel: FastenDisplayModel = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fastenApi: FastenApiService
  ) {}

  ngOnInit(): void {
    const resourceId = this.route.snapshot.paramMap.get('id');

    if (!resourceId) {
      this.router.navigate(['/']);
      return;
    }

    this.loading = true;

    this.fastenApi.searchSingleResource({ id: resourceId }).subscribe({
      next: (response: any) => {
        if (!response || !response.resource) {
          console.error('No resource found for ID:', resourceId);
          this.loading = false;
          this.router.navigate(['/']);
          return;
        }

        this.resource = response.resource;

        try {
          const parsed = fhirModelFactory(
            response.resource.source_resource_type as ResourceType,
            response.resource
          );

          this.displayModel = parsed;
          this.loading = false;
        } catch (e) {
          console.error('Error parsing FHIR model:', e);
        }
      },
      error: (error) => {
        console.error('Error fetching resource:', error);
        this.loading = false;
        this.router.navigate(['/']);
      },
    });
  }
}
