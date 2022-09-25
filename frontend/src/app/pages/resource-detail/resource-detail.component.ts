import { Component, OnInit } from '@angular/core';
import {FastenApiService} from '../../services/fasten-api.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Source} from '../../models/fasten/source';
import {ResourceFhir} from '../../models/fasten/resource_fhir';

@Component({
  selector: 'app-resource-detail',
  templateUrl: './resource-detail.component.html',
  styleUrls: ['./resource-detail.component.scss']
})
export class ResourceDetailComponent implements OnInit {

  resource: ResourceFhir = null

  constructor(private fastenApi: FastenApiService, private router: Router, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    //always request the resource by id
    this.fastenApi.getResourceBySourceId(this.route.snapshot.paramMap.get('source_id'), this.route.snapshot.paramMap.get('resource_id')).subscribe((resourceFhir) => {
      this.resource = resourceFhir;
    });
  }

}
