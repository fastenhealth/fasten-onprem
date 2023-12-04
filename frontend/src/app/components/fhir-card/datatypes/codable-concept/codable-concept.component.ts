import {Component, Input, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CodingComponent} from '../coding/coding.component';
import {CodingModel} from '../../../../../lib/models/datatypes/coding-model';
import {CodableConceptModel} from '../../../../../lib/models/datatypes/codable-concept-model';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'fhir-codable-concept',
  templateUrl: './codable-concept.component.html',
  styleUrls: ['./codable-concept.component.scss']
})
export class CodableConceptComponent implements OnInit {
  @Input() codableConcept: CodableConceptModel

  constructor() { }

  ngOnInit(): void {
  }

}
