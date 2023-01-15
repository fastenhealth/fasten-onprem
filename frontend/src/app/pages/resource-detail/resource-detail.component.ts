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

  sourceId: string = ""
  sourceName: string = ""
  resource: ResourceFhir = null
  displayModel: FastenDisplayModel = null

  constructor(private fastenApi: FastenApiService, private router: Router, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.loading = true
    this.fastenApi.getResourceBySourceId(this.route.snapshot.paramMap.get('source_id'), this.route.snapshot.paramMap.get('resource_id')).subscribe((resourceFhir) => {
      this.loading = false
      console.log("RESOURECE FHIR", resourceFhir)
      this.resource = resourceFhir;
      this.sourceId = this.route.snapshot.paramMap.get('source_id')
      this.sourceName = "unknown" //TODO popualte this

      try{
        let parsed = fhirModelFactory(resourceFhir.source_resource_type as ResourceType, resourceFhir)
        this.displayModel = parsed
        console.log("Successfully parsed model", parsed)
      } catch (e) {
        console.log("FAILED TO PARSE", resourceFhir)
        console.error(e)
      }
    }, error => {
      this.loading = false
    });
  }

}
