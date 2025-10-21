import { Component, OnInit } from '@angular/core';
import {FastenApiService} from '../../services/fasten-api.service';
import {ActivatedRoute, Router} from '@angular/router';
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
  resource: ResourceFhir = null
  displayModel: FastenDisplayModel = null

  // Delegated access
  showDelegateAccessModal = false;
  users: any[] = [];
  selectedUserId: string | null = null;
  selectedAccessType: string | null = null;

  constructor(private fastenApi: FastenApiService, private router: Router, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.loading = true
    this.fastenApi.getResourceBySourceId(this.route.snapshot.paramMap.get('source_id'), this.route.snapshot.paramMap.get('resource_id')).subscribe((resourceFhir) => {
      this.loading = false
      this.resource = resourceFhir;
      this.sourceId = this.route.snapshot.paramMap.get('source_id')
      this.sourceName = "unknown" //TODO popualte this

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

  openDelegateAccessModal() {
    this.showDelegateAccessModal = true;
    // Fetch user list if not already loaded
    if (this.users.length === 0) {
      this.loadUsers();
    }
  }

  closeDelegateAccessModal() {
    this.showDelegateAccessModal = false;
    this.selectedUserId = null;
    this.selectedAccessType = null;
  }

  loadUsers() {
    this.fastenApi.getAllUserLightweight().subscribe((data: any[]) => {
      this.users = data;
    });
  }

  submitDelegation() {
    const payload = {
      delegateUserId: this.selectedUserId,
      accessLevel: this.selectedAccessType,
      resourceType: this.resource?.source_resource_type,
      resourceId: this.resource?.source_resource_id,
    };

    this.fastenApi.createDelegation(payload).subscribe({
      next: () => {
        this.closeDelegateAccessModal();
      },
      error: (err) => {
        console.error('Error creating delegation:', err);
      },
    });
  }
}
