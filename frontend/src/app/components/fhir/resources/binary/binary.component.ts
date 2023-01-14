import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {BinaryModel} from '../../../../../lib/models/resources/binary-model';
import {FhirResourceComponentInterface} from '../../fhir-resource/fhir-resource-component-interface';
import {Router} from '@angular/router';

@Component({
  selector: 'fhir-binary',
  templateUrl: './binary.component.html',
  styleUrls: ['./binary.component.scss']
})
export class BinaryComponent implements OnInit, FhirResourceComponentInterface {
  @Input() displayModel: BinaryModel
  @Input() showDetails: boolean = true

  constructor(public changeRef: ChangeDetectorRef, public router: Router) {}

  ngOnInit(): void {
  }
  markForCheck(){
    this.changeRef.markForCheck()
  }

}
