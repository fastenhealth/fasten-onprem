import { Component, OnInit } from '@angular/core';
import {FastenDbService} from '../../services/fasten-db.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ResourceFhir} from '../../../lib/models/database/resource_fhir';
import {Base64} from '../../../lib/utils/base64';

@Component({
  selector: 'app-resource-detail',
  templateUrl: './resource-detail.component.html',
  styleUrls: ['./resource-detail.component.scss']
})
export class ResourceDetailComponent implements OnInit {

  resource: ResourceFhir = null

  constructor(private fastenDb: FastenDbService, private router: Router, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    //always request the resource by id
    this.fastenDb.GetResource(Base64.Decode(this.route.snapshot.paramMap.get('resource_id')))
      .then((resourceFhir) => {
        this.resource = resourceFhir;
      });
  }

}
