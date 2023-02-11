import {Component, Input, OnInit} from '@angular/core';
import {Observable, ObservableInput, of} from 'rxjs';
import {catchError, debounceTime, distinctUntilChanged, switchMap, tap} from 'rxjs/operators';
import {NlmClinicalTableSearchService} from '../../services/nlm-clinical-table-search.service';

export enum NlmSearchType {
  Allergy = 'Allergy',
  AllergyReaction = 'AllergyReaction',
  Condition = 'Condition',
  MedicalContactType = 'MedicalContactType',
  MedicalContactIndividual = 'MedicalContactIndividual',
  Medication = 'Medication',
  MedicationWhyStopped = 'MedicationWhyStopped',
  Procedure = 'Procedure',
  Vaccine = 'Vaccine',


}

@Component({
  selector: 'app-nlm-typeahead',
  templateUrl: './nlm-typeahead.component.html',
  styleUrls: ['./nlm-typeahead.component.scss']
})
export class NlmTypeaheadComponent implements OnInit {
  @Input() searchType: NlmSearchType = NlmSearchType.Condition;
  model: any = {};
  searching = false;
  searchFailed = false;

  constructor(private nlmClinicalTableSearchService: NlmClinicalTableSearchService) { }

  ngOnInit(): void {
  }

  // search = (text$: Observable<string>) => {
  //   return text$.pipe(
  //     debounceTime(200),
  //     distinctUntilChanged(),
  //     map((term) =>
  //       term.length < 2 ? [] : this.states.filter((v) => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10),
  //     ),
  //   );
  // }

  formatter = (x: { text: string }) => x.text;
  search = (text$: Observable<string>) => {
    let searchOpFn
    switch (this.searchType) {
      case NlmSearchType.Allergy:
        searchOpFn = this.nlmClinicalTableSearchService.searchAllergy
        break
      case NlmSearchType.AllergyReaction:
        searchOpFn = this.nlmClinicalTableSearchService.searchAllergyReaction
        break
      case NlmSearchType.Condition:
        searchOpFn = this.nlmClinicalTableSearchService.searchCondition
        break
      case NlmSearchType.MedicalContactType:
        searchOpFn = this.nlmClinicalTableSearchService.searchMedicalContactType
        break
      case NlmSearchType.MedicalContactIndividual:
        searchOpFn = this.nlmClinicalTableSearchService.searchMedicalContactIndividual
        break
      case NlmSearchType.Medication:
        searchOpFn = this.nlmClinicalTableSearchService.searchMedication
        break
      case NlmSearchType.MedicationWhyStopped:
        searchOpFn = this.nlmClinicalTableSearchService.searchMedicationWhyStopped
        break
      case NlmSearchType.Procedure:
        searchOpFn = this.nlmClinicalTableSearchService.searchProcedure
        break
      case NlmSearchType.Vaccine:
        searchOpFn = this.nlmClinicalTableSearchService.searchVaccine
        break
      default:
        console.error(`unknown search type: ${this.searchType}`)
        return of([]);
    }

    // https://github.com/ng-bootstrap/ng-bootstrap/issues/917
    // Note that the this argument is undefined so you need to explicitly bind it to a desired "this" target.
    // https://ng-bootstrap.github.io/#/components/typeahead/api
    searchOpFn = searchOpFn.bind(this.nlmClinicalTableSearchService)

    return text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => { this.searching = true }),
      switchMap((term): ObservableInput<any> => {


        //must use bind
        return searchOpFn(term).pipe(
          tap(() => {this.searchFailed = false}),
          catchError(() => {
            this.searchFailed = true;
            return of([]);
          }),
        )
      }),
      tap(() => {this.searching = false}),
    );
  }
}
