import {Component, Input, OnInit} from '@angular/core';
import {BinaryModel} from '../../../../../lib/models/resources/binary-model';

@Component({
  selector: 'fhir-pdf',
  templateUrl: './pdf.component.html',
  styleUrls: ['./pdf.component.scss']
})
export class PdfComponent implements OnInit {
  @Input() displayModel: BinaryModel

  height: number
  constructor() { }

  ngOnInit(): void {
    const maxHeight = 600;
    const contentHeight = (1111 * this.displayModel.data.length) / (24996 / 7.5);
    this.height = Math.min(maxHeight, contentHeight);
  }

}
