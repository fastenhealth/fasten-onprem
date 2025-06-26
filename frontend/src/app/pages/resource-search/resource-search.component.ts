import { Component, OnInit } from '@angular/core';
import { FastenApiService } from '../../services/fasten-api.service';
import {
  TypesenseDocument,
  TypesenseSearchResponse,
} from '../../models/typesense/typesense-result-model';

@Component({
  selector: 'resource-search',
  templateUrl: './resource-search.component.html',
  styleUrls: ['./resource-search.component.scss'],
})
export class ResourceSearchComponent implements OnInit {
  searchQuery: string = '';
  selectedResourceType: string = '';
  page: number = 1;
  perPage: number = 10;

  totalResults: number = 0;
  results: TypesenseDocument[] = [];

  supportedTypes: string[] = [
    'Appointment',
    'AllergyIntolerance',
    'AdverseEvent',
    'Binary',
    'CarePlan',
    'CareTeam',
    'Communication',
    'Condition',
    'Coverage',
    'Device',
    'DeviceRequest',
    'DiagnosticReport',
    'DocumentReference',
    'Encounter',
    'Goal',
    'Immunization',
    'Location',
    'Medication',
    'MedicationAdministration',
    'MedicationDispense',
    'MedicationRequest',
    'NutritionOrder',
    'Observation',
    'Organization',
    'Patient',
    'Practitioner',
    'Procedure',
    'ServiceRequest',
  ];

  constructor(private fastenApi: FastenApiService) {}

  ngOnInit(): void {
    this.search();
  }

  viewResource(doc: TypesenseDocument): void {
    console.log('Selected document:', doc);
    // Next: either show in modal or route to a detail page with the JSON
  }

  search(): void {
    this.fastenApi
      .searchResources({
        query: this.searchQuery,
        type: this.selectedResourceType,
        page: this.page,
        per_page: this.perPage,
      })
      .subscribe((response: TypesenseSearchResponse) => {
        this.results = response.results.map((doc: any) => ({
          ...doc,
          resource_raw:
            typeof doc.resource_raw === 'string'
              ? JSON.parse(doc.resource_raw)
              : doc.resource_raw,
        }));
        this.totalResults = response.total;
      });
  }

  onPageChange(newPage: number): void {
    this.page = newPage;
    this.search();
  }

  get totalPages(): number {
    return Math.ceil(this.totalResults / this.perPage);
  }

  onPerPageChange(): void {
    this.page = 1;
    this.search();
  }
}
