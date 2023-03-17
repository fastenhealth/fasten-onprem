import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NlmTypeaheadComponent } from './nlm-typeahead.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {NgbActiveModal, NgbCollapseModule, NgbTypeaheadModule} from '@ng-bootstrap/ng-bootstrap';
import {FastenApiService} from '../../services/fasten-api.service';
import {NlmClinicalTableSearchService} from '../../services/nlm-clinical-table-search.service';

describe('NlmTypeaheadComponent', () => {
  let component: NlmTypeaheadComponent;
  let fixture: ComponentFixture<NlmTypeaheadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NgbTypeaheadModule
      ],
      declarations: [ NlmTypeaheadComponent ],
      providers: [{
        provide: NlmClinicalTableSearchService,
        useValue: jasmine.createSpyObj('NlmClinicalTableSearchService', [
          'searchAllergy',
          'searchAllergyReaction',
          'searchCondition',
          'searchCountries',
          'searchMedicalContactIndividualProfession',
          'searchMedicalContactIndividual',
          'searchMedicalContactOrganization',
          'searchMedicalContactOrganizationType',
          'searchMedication',
          'searchMedicationWhyStopped',
          'searchProcedure',
          'searchVaccine',
        ])
      }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NlmTypeaheadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
