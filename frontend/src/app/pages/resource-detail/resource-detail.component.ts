import { Component, OnInit } from '@angular/core';
import {FastenApiService} from '../../services/fasten-api.service';
import {ActivatedRoute} from '@angular/router';
import {ResourceFhir} from '../../models/fasten/resource_fhir';
import {fhirModelFactory} from '../../../lib/models/factory';
import {ResourceType} from '../../../lib/models/constants';
import {FastenDisplayModel} from '../../../lib/models/fasten/fasten-display-model';

@Component({
  selector: 'app-resource-detail',
  templateUrl: './resource-detail.component.html',
  styleUrls: ['./resource-detail.component.scss']
})
export class ResourceDetailComponent implements OnInit {
  loading: boolean = false
  debugMode = false;


  sourceId: string = ""
  sourceName: string = ""
  ownerUserId: string = ""
  resource: ResourceFhir = null
  displayModel: FastenDisplayModel = null
  isDelegatedResource: boolean = false;
  
  // Delegated resource edit
  isJsonValid = true;
  editableJson = '';
  canEditResource = false;

  constructor(private fastenApi: FastenApiService, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.isDelegatedResource = params['isDelegatedResource'] === 'true';
      this.ownerUserId = params['ownerUserId'] || '';
    });
    this.loading = true

    if (this.isDelegatedResource && this.ownerUserId) {
      this.getCurrentDelegationInfo();
      this.getDelegatedResource();
      return;
    }

    this.fastenApi.getResourceBySourceId(this.route.snapshot.paramMap.get('source_id'), this.route.snapshot.paramMap.get('resource_id')).subscribe((resourceFhir) => {
      this.loading = false
      this.resource = resourceFhir;
      this.sourceId = this.route.snapshot.paramMap.get('source_id')
      this.sourceName = "unknown" //TODO: populate this

      try{
        let parsed = fhirModelFactory(resourceFhir.source_resource_type as ResourceType, resourceFhir)
        this.displayModel = parsed
      } catch (e) {
        console.error(e)
      }
    }, error => {
      this.loading = false
    });
  }

  private getDelegatedResource() {
     this.fastenApi.getDelegatedResourceBySourceId(
        this.ownerUserId,
        this.route.snapshot.paramMap.get('source_id'),
        this.route.snapshot.paramMap.get('resource_id')
      ).subscribe((resourceFhir) => {
        this.loading = false
        this.resource = resourceFhir;
        this.editableJson = JSON.stringify(this.resource.resource_raw, null, 2);
        this.sourceId = this.route.snapshot.paramMap.get('source_id')
        this.sourceName = "unknown" //TODO: populate this

        try{
          let parsed = fhirModelFactory(resourceFhir.source_resource_type as ResourceType, resourceFhir)
          this.displayModel = parsed
        } catch (e) {
          console.error(e)
        }
      }, error => {
        this.loading = false
      });
  }

  validateJson(): boolean {
    try {
      JSON.parse(this.editableJson);
      this.isJsonValid = true;
    } catch (e) {
      this.isJsonValid = false;
    }
    return this.isJsonValid;
  }

  saveEditedResource() {
    const raw = this.editableJson;
    try {
      const parsed = JSON.parse(raw);
      this.fastenApi.updateDelegatedResource(
        this.resource.source_resource_type,
        this.resource.source_resource_id,
        this.resource.source_id,
        {
          resource_raw: parsed
        }
      ).subscribe(() => {
        alert('Resource updated successfully');
        this.getCurrentDelegationInfo();
        this.getDelegatedResource();
      }, error => {
        alert('Failed to update resource');
      });
    } catch {
      alert('Invalid JSON');
    }
  }

  private getCurrentDelegationInfo() {
    this.fastenApi.getDelegationsSharedWithCurrentUser().subscribe((delegations) => {
     delegations.find(delegation => {
        if (delegation.source_id === this.route.snapshot.paramMap.get('source_id')) {
          this.canEditResource = delegation.access_level === 'EDIT';
          return true;
        }
        return false;
      });
    });
  }
}
