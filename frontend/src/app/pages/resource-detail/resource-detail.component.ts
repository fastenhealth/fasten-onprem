import { Component, OnInit } from '@angular/core';
import {FastenApiService} from '../../services/fasten-api.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ResourceFhir} from '../../models/fasten/resource_fhir';
import {Base64} from '../../../lib/utils/base64';

@Component({
  selector: 'app-resource-detail',
  templateUrl: './resource-detail.component.html',
  styleUrls: ['./resource-detail.component.scss']
})
export class ResourceDetailComponent implements OnInit {
  sourceId: string = ""
  sourceName: string = ""
  resource: ResourceFhir = null

  constructor(private fastenApi: FastenApiService, private router: Router, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.fastenApi.getResourceBySourceId(this.route.snapshot.paramMap.get('source_id'), this.route.snapshot.paramMap.get('resource_id')).subscribe((resourceFhir) => {
      console.log("RESOURECE FHIR", resourceFhir)
      this.resource = resourceFhir;
      this.sourceId = this.route.snapshot.paramMap.get('source_id')
      this.sourceName = "unknown" //TODO popualte this
    });
  }

}
