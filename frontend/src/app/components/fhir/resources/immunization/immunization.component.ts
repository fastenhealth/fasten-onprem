import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {FhirResourceComponentInterface} from '../../fhir-resource/fhir-resource-component-interface';
import {BinaryModel} from '../../../../../lib/models/resources/binary-model';
import {Router} from '@angular/router';
import {ImmunizationModel} from '../../../../../lib/models/resources/immunization-model';

@Component({
  selector: 'fhir-immunization',
  templateUrl: './immunization.component.html',
  styleUrls: ['./immunization.component.scss']
})
export class ImmunizationComponent implements OnInit, FhirResourceComponentInterface {
  @Input() displayModel: ImmunizationModel

  constructor(public changeRef: ChangeDetectorRef, public router: Router) {}

  ngOnInit(): void {
  }
  markForCheck(){
    this.changeRef.markForCheck()
  }

}
