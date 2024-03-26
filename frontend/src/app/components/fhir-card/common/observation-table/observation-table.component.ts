import { Component, Input, OnInit } from '@angular/core';
import { ObservationModel } from '../../../../../lib/models/resources/observation-model';
import { CommonModule, formatDate } from '@angular/common';

@Component({
  standalone: true,
  selector: 'observation-table',
  imports: [ CommonModule ],
  templateUrl: './observation-table.component.html',
  styleUrls: ['./observation-table.component.scss']
})
export class ObservationTableComponent implements OnInit {
  @Input() observations: ObservationModel[]

  headers: string[] = []
  rows: string[][] = []

  constructor() { }

  ngOnInit(): void {
    if(!this.observations || !this.observations[0]) {
      return;
    }

    let displayRange = this.rangeExists(this.observations);

    if (displayRange) {
      this.headers = ['Date', 'Result', 'Reference Range'];
      this.rows = this.observations.map((observation) => {
        return [this.formatDate(observation.effective_date), observation.value_model?.display(), observation.reference_range?.display()];
      });
    } else {
      this.headers = ['Date', 'Result'];
      this.rows = this.observations.map((observation) => {
        return [this.formatDate(observation.effective_date), observation.value_model?.display()];
      });
    }
  }

  private rangeExists(observations: ObservationModel[]): boolean {
    return observations.some((observation) => { return observation.reference_range?.hasValue() })
  }

  private formatDate(date: string | number | Date): string {
    if (date) {
      return formatDate(date, "mediumDate", "en-US", undefined);
    } else {
      return 'Unknown date';
    }
  }
}
