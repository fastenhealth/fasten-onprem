import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EncounterFormComponent } from './encounter-form.component';
import {
  NgbActiveModal,
  NgbCollapseModule,
  NgbDatepickerModule,
  NgbModal,
  NgbNavModule,
  NgbTooltipModule,
  NgbTypeaheadModule,
} from '@ng-bootstrap/ng-bootstrap';
import { NlmTypeaheadComponent } from 'src/app/components/nlm-typeahead/nlm-typeahead.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { HighlightModule } from 'ngx-highlightjs';
import { FhirCardModule } from 'src/app/components/fhir-card/fhir-card.module';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { HttpClientModule } from '@angular/common/http';

describe('EncounterFormComponent', () => {
  let component: EncounterFormComponent;
  let fixture: ComponentFixture<EncounterFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EncounterFormComponent, NlmTypeaheadComponent],
      imports: [
        NgbCollapseModule,
        NgbNavModule,
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        NgbTypeaheadModule,
        NgbDatepickerModule,
        NgbTooltipModule,
        NgSelectModule,
        HighlightModule,
        FhirCardModule,
        PipesModule,
        HttpClientModule,
      ],
      providers: [NgbActiveModal, NgbModal],
    }).compileComponents();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
