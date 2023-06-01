import { Component, OnInit } from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  selector: 'empty-widget',
  templateUrl: './empty-widget.component.html',
  styleUrls: ['./empty-widget.component.scss']
})
export class EmptyWidgetComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
