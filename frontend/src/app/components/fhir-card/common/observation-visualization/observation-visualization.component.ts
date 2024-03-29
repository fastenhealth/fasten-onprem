import { Component, Input, OnInit } from '@angular/core';
import { ObservationModel } from '../../../../../lib/models/resources/observation-model';
import { CommonModule } from '@angular/common';
import { ObservationBarChartComponent } from '../observation-bar-chart/observation-bar-chart.component';
import { ObservationTableComponent } from '../observation-table/observation-table.component';

@Component({
  standalone: true,
  selector: 'observation-visualization',
  imports: [ CommonModule, ObservationBarChartComponent, ObservationTableComponent ],
  templateUrl: './observation-visualization.component.html',
  styleUrls: ['./observation-visualization.component.scss']
})
export class ObservationVisualizationComponent implements OnInit {
  @Input() observations: ObservationModel[]
  @Input() preferredVisualizationType?: string = 'bar'

  visualizationType: string = ''

  constructor() { }

  ngOnInit(): void {
    if(!this.observations || !this.observations[0] || !this.observations[0].value_model) {
      return;
    }

    this.visualizationType = this.pickVisualizationType(this.preferredVisualizationType, this.observations)
  }

  // Right now this is just looking at the first observation's visualization types. If the preferred type is one of the
  // accepted types, then use it. Otherwise just use the first observation's first visualization type.
  private pickVisualizationType(preferredType: string, observations: ObservationModel[]): string {
    if (preferredType && observations[0].value_model.visualizationTypes().includes(preferredType)) {
      return preferredType;
    } else {
      return observations[0].value_model.visualizationTypes()[0];
    }
  }
}
