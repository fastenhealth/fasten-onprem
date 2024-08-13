import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { PatientModel } from '../../../../../lib/models/resources/patient-model';
import { BadgeComponent } from '../../common/badge/badge.component';
import { TableComponent } from '../../common/table/table.component';
import { FhirCardComponentInterface } from '../../fhir-card/fhir-card-component-interface';

@Component({
  standalone: true,
  imports: [NgbCollapseModule, CommonModule, BadgeComponent, TableComponent, RouterModule],
  selector: 'fhir-patient',
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.scss']
})
export class PatientComponent implements OnInit, FhirCardComponentInterface {
  @Input() displayModel: PatientModel;
  @Input() showDetails: boolean = true;
  @Input() isCollapsed: boolean = false;

  constructor(public changeRef: ChangeDetectorRef, public router: Router) { }

  ngOnInit(): void {
  }

  markForCheck(){
    this.changeRef.markForCheck()
  }

}
