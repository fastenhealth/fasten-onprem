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
  sourceId: string = ""
  sourceName: string = ""
  resource: ResourceFhir = null

  constructor(private fastenDb: FastenDbService, private router: Router, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    //always request the resource by id
    let resourceId = Base64.Decode(this.route.snapshot.paramMap.get('resource_id'))
    if (resourceId){
      this.fastenDb.GetResource(resourceId)
        .then((resourceFhir) => {
          this.resource = resourceFhir;
        });
      this.sourceId = resourceId.split(":")[1]
      this.sourceName = Base64.Decode(this.sourceId).split(":")[1]
    } else {
      console.log("invalid or missing resource id")
    }

  }

}
