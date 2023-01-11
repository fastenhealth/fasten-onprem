import {Component, Input, OnInit} from '@angular/core';
import {BinaryModel} from '../../../../../lib/models/resources/binary-model';

@Component({
  selector: 'fhir-markdown',
  templateUrl: './markdown.component.html',
  styleUrls: ['./markdown.component.scss']
})
export class MarkdownComponent implements OnInit {
  @Input() fhirModel: BinaryModel

  constructor() { }

  ngOnInit(): void {
  }

}
