import {Component, Input, OnInit} from '@angular/core';
import {BinaryModel} from '../../../../../lib/models/resources/binary-model';

@Component({
  selector: 'fhir-binary-text',
  templateUrl: './binary-text.component.html',
  styleUrls: ['./binary-text.component.scss']
})
export class BinaryTextComponent implements OnInit {
  @Input() fhirModel: BinaryModel

  constructor() { }

  ngOnInit(): void {
  }

}
