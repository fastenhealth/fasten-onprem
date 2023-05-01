import {Component, Input, OnInit} from '@angular/core';
import {CodingModel} from '../../../../../lib/models/datatypes/coding-model';
import {CommonModule} from "@angular/common";

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'fhir-coding',
  templateUrl: './coding.component.html',
  styleUrls: ['./coding.component.scss']
})
export class CodingComponent implements OnInit {
  @Input() coding: CodingModel
  has_additional_info: boolean = false
  constructor() { }


  ngOnInit(): void {
    this.has_additional_info = !!(this.coding?.code || this.coding?.system)
  }

}
