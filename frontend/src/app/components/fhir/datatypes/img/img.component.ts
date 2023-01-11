import {Component, Input, OnInit} from '@angular/core';
import {BinaryModel} from '../../../../../lib/models/resources/binary-model';

@Component({
  selector: 'fhir-img',
  templateUrl: './img.component.html',
  styleUrls: ['./img.component.scss']
})
export class ImgComponent implements OnInit {
  @Input() fhirModel: BinaryModel

  constructor() { }

  ngOnInit(): void {
  }

}
