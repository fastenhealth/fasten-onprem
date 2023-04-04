import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {BinaryModel} from '../../../../../lib/models/resources/binary-model';
import {FhirResourceComponentInterface} from '../../fhir-resource/fhir-resource-component-interface';
import {Router} from '@angular/router';
import {AttachmentModel} from '../../../../../lib/models/datatypes/attachment-model';
import {FastenApiService} from '../../../../services/fasten-api.service';

@Component({
  selector: 'fhir-binary',
  templateUrl: './binary.component.html',
  styleUrls: ['./binary.component.scss']
})
export class BinaryComponent implements OnInit, FhirResourceComponentInterface {
  @Input() displayModel: BinaryModel
  @Input() showDetails: boolean = true
  @Input() attachmentSourceId: string
  @Input() attachmentModel: AttachmentModel //can only have attachmentModel or binaryModel, not both.

  loading: boolean = false
  constructor(public changeRef: ChangeDetectorRef, public router: Router, public fastenApi: FastenApiService) {}

  ngOnInit(): void {
    if(!this.displayModel && this.attachmentSourceId && this.attachmentModel){
      this.loading = true
      this.fastenApi.getBinaryModel(this.attachmentSourceId, this.attachmentModel)
        .subscribe((binaryModel: BinaryModel) => {
          this.loading = false
          this.displayModel = binaryModel
          this.markForCheck()
        }, (error) => {
          this.loading = false
          this.markForCheck()
        })
    }
  }
  markForCheck(){
    this.changeRef.markForCheck()
  }
}
