import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {ResourceFhir} from '../../../lib/models/database/resource_fhir';
import {ResourceListComponentInterface} from '../list-generic-resource/list-generic-resource.component';
import {Router} from '@angular/router';
import {Base64} from '../../../lib/utils/base64';

@Component({
  selector: 'app-list-fallback-resource',
  templateUrl: './list-fallback-resource.component.html',
  styleUrls: ['./list-fallback-resource.component.scss']
})
export class ListFallbackResourceComponent  implements OnInit, ResourceListComponentInterface  {

  @Input() resourceList: ResourceFhir[] = []

  constructor(public changeRef: ChangeDetectorRef, public router: Router) {}

  ngOnInit(): void {
    console.log("RESOURCE LIST INSIDE FALLBACK", this.resourceList)
  }

  markForCheck(){
    this.changeRef.markForCheck()
  }

  //TODO this should eb moved to a Pipe
  getResourceIdEncoded(resource: ResourceFhir){
    return Base64.Encode(resource._id)
  }

}
