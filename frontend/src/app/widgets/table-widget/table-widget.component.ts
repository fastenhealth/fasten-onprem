import { Component, OnInit } from '@angular/core';
import {ChartsModule} from 'ng2-charts';

@Component({
  standalone: true,
  imports: [ChartsModule],
  selector: 'table-widget',
  templateUrl: './table-widget.component.html',
  styleUrls: ['./table-widget.component.scss']
})
export class TableWidgetComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
