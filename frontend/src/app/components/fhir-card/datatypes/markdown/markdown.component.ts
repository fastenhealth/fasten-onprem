import {Component, Input, OnInit} from '@angular/core';
import {BinaryModel} from '../../../../../lib/models/resources/binary-model';
import {CommonModule} from "@angular/common";

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'fhir-markdown',
  templateUrl: './markdown.component.html',
  styleUrls: ['./markdown.component.scss']
})
export class MarkdownComponent implements OnInit {
  @Input() displayModel: BinaryModel

  constructor() { }

  ngOnInit(): void {
  }

}
