import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {CodingModel} from '../../lib/models/datatypes/coding-model';

export interface NlmSearchResults {
  id: string
  text: string
  subtext?: string //used for display purposes only
  parentAnswerCode?: string
  link?: string
  identifier?: CodingModel[]

  provider_type?: {
    id: string,
    text: string,
    identifier?: CodingModel[]
  }
  provider_address?: {
    line1?: string
    line2?: string
    city?: string
    state?: string
    zip?: string
    country?: string
  }
  provider_phone?: string
  provider_fax?: string
}


@Injectable({
  providedIn: 'root'
})
export class NlmClinicalTableSearchService {

  nlm_clinical_table_search_endpoint = 'https://clinicaltables.nlm.nih.gov/api'
  wikipedia_search_endpoint = 'https://en.wikipedia.org/w/api.php'


  //TODO: these endpoints should be proxied via the Fasten server
  constructor(private _httpClient: HttpClient) {
  }


  //helper, parses CTSS responses (which are array structures, not objects)

  //https://clinicaltables.nlm.nih.gov/api/conditions/v3/search?terms=xxx
  searchCondition(searchTerm: string): Observable<NlmSearchResults[]> {
    let queryParams = {
      'terms':searchTerm,
      'df':'key_id,consumer_name,info_link_data,icd10cm_codes',
    }
    return this._httpClient.get<any>(
      `${this.nlm_clinical_table_search_endpoint}/conditions/v3/search`, {params: queryParams}
    ).pipe(
        map((response) => {
          console.log("RESPONSE", response)
          let results =  response[3].map((item: any):NlmSearchResults => {
            return {
              id: item[0],
              text: item[1],
              link: item[2].split(',')[0], //link includes a description at the end, comma separated.
              identifier: [
                {
                  system: 'http://hl7.org/fhir/sid/icd-10',
                  code: item[3].split(',')[0],
                  display: item[1]
                }
              ], //link includes a description at the end, comma separated.
            }
          })
          return results
        })
      );
  }

  //https://clinicaltables.nlm.nih.gov/api/rxterms/v3/search?ef=SXDG_RXCUI,DISPLAY_NAME&terms=xxx
  searchMedication(searchTerm: string): Observable<NlmSearchResults[]> {
    let queryParams = {
      'ef': 'SXDG_RXCUI,DISPLAY_NAME',
      'terms':searchTerm
    }
    return this._httpClient.get<any>(`${this.nlm_clinical_table_search_endpoint}/rxterms/v3/search`, {params: queryParams})
      .pipe(
        map((response) => {
          let results: NlmSearchResults[] = []
          for(let ndx in response[2]['SXDG_RXCUI']){
            results.push({
              id: response[2]['SXDG_RXCUI'][ndx], //code response can be a comma sep list (string) of multiple codes
              text: response[2]['DISPLAY_NAME'][ndx],
              identifier: [
                {
                  system: 'http://hl7.org/fhir/sid/rxnorm',
                  code: response[2]['SXDG_RXCUI'][ndx],
                  display: response[2]['DISPLAY_NAME'][ndx]
                }
              ]
            })
          }
          return results
        })
      )
  }

  //see https://lhcforms.nlm.nih.gov/phr.json
  //see http://hl7.org/fhir/R4/valueset-medicationrequest-status-reason.html
  searchMedicationWhyStopped(searchTerm: string): Observable<NlmSearchResults[]> {
    let searchOptions: NlmSearchResults[] = [
      {"id": "STP-1", "text": "Finished the prescription"},
      {"id": "STP-2", "text": "Dose change", identifier: [{system: 'http://terminology.hl7.org/CodeSystem/medicationrequest-status-reason', code: 'drughigh'}]},
      {"id": "STP-3", "text": "Problem gone", },
      {"id": "STP-4", "text": "Replaced by better drug"},
      {"id": "STP-5", "text": "Could not tolerate side effects"},
      {"id": "STP-6", "text": "Didn't work"},
      {"id": "STP-7", "text": "Allergy", identifier: [{system: 'http://terminology.hl7.org/CodeSystem/medicationrequest-status-reason', code: 'salg'}]},
      {"id": "STP-8", "text": "Too expensive"},
      {"id": "STP-9", "text": "Not covered by insurance"},
      {"id": "STP-10","text": "I don't know"},
      {"id": "STP-11","text": "Pregnant", identifier: [{system: 'http://terminology.hl7.org/CodeSystem/medicationrequest-status-reason', code: 'preg'}]}
    ]
    let result = searchTerm.length == 0 ? searchOptions : searchOptions.filter((v) => v['text'].toLowerCase().indexOf(searchTerm.toLowerCase()) > -1).slice(0, 10)
    return of(result)
  }

  //see https://lhcforms.nlm.nih.gov/phr.json
  searchAllergy(searchTerm: string): Observable<NlmSearchResults[]> {
    let searchOptions: NlmSearchResults[] = [
      {"id": "food", "text": "Food allergies"},
      {"id": "FOOD-2", "text": "Chocolate",
        "parentAnswerCode": "food",
        "link": "http://www.mayoclinic.com/health/food-allergy/DS00082"},
      {"id": "FOOD-22", "text": "Crab",
        "parentAnswerCode": "food",
        "link": "http://www.foodallergy.org/allergens/shellfish-allergy"},
      {"id": "FOOD-4", "text": "Egg",
        "parentAnswerCode": "food",
        "link": "http://www.foodallergy.org/allergens/egg-allergy"},
      {"id": "FOOD-5", "text": "Fish",
        "parentAnswerCode": "food",
        "link": "http://www.foodallergy.org/allergens/fish-allergy"},
      {"id": "FOOD-7", "text": "Gluten",
        "parentAnswerCode": "food",
        "link": "http://www.foodallergy.org/allergens/wheat-allergy"},
      {"id": "FOOD-19", "text": "Milk",
        "parentAnswerCode": "food",
        "link": "http://www.foodallergy.org/page/milk-allergy"},
      {"id": "FOOD-16", "text": "Monosodium Glutamate (MSG)",
        "parentAnswerCode": "food",
        "link": "http://www.nlm.nih.gov/medlineplus/ency/article/001126.htm"},
      {"id": "FOOD-9", "text": "Peanut",
        "parentAnswerCode": "food",
        "link": "http://www.foodallergy.org/allergens/peanut-allergy"},
      {"id": "FOOD-10", "text": "Pork",
        "parentAnswerCode": "food",
        "link": "http://www.foodallergy.org/allergens/other-allergens"},
      {"id": "FOOD-18", "text": "Sesame",
        "parentAnswerCode": "food",
        "link": "http://www.foodallergy.org/allergens/other-allergens"},
      {"id": "FOOD-12", "text": "Shellfish",
        "parentAnswerCode": "food",
        "link": "http://www.foodallergy.org/allergens/shellfish-allergy"},
      {"id": "FOOD-21", "text": "Shrimp",
        "parentAnswerCode": "food",
        "link": "http://www.foodallergy.org/allergens/shellfish-allergy"},
      {"id": "FOOD-13", "text": "Soy",
        "parentAnswerCode": "food",
        "link": "http://www.foodallergy.org/allergens/soy-allergy"},
      {"id": "FOOD-14", "text": "Tomatoes",
        "parentAnswerCode": "food",
        "link": "http://www.foodallergy.org/allergens/other-allergens"},
      {"id": "FOOD-17", "text": "Tree Nuts",
        "parentAnswerCode": "food",
        "link": "http://www.foodallergy.org/allergens/tree-nut-allergy"},
      {"id": "FOOD-20", "text": "Wheat",
        "parentAnswerCode": "food",
        "link": "http://www.foodallergy.org/allergens/wheat-allergy"},
      {"id": "FOOD-23", "text": "Cochineal extract (Carmine) red dye",
        "parentAnswerCode": "food",
        "link": "http://www.nlm.nih.gov/medlineplus/ency/article/000817.htm"},
      {"id": "FOOD-24", "text": "FD&C Blue No. 1 dye",
        "parentAnswerCode": "food",
        "link": "http://www.nlm.nih.gov/medlineplus/ency/article/000817.htm"},
      {"id": "FOOD-25", "text": "FD&C Yellow No. 2 dye",
        "parentAnswerCode": "food",
        "link": "http://www.nlm.nih.gov/medlineplus/ency/article/000817.htm"},
      {"id": "environmental", "text": "Environmental allergies"},
      {"id": "OTHR-18", "text": "Cat",
        "parentAnswerCode": "environmental",
        "link": "http://www.mayoclinic.com/health/pet-allergy/DS00859"},
      {"id": "OTHR-4", "text": "Cockroach",
        "parentAnswerCode": "environmental",
        "link": "http://www.aafa.org/display.cfm?id=9&sub=22&cont=312"},
      {"id": "OTHR-5", "text": "Cold Weather",
        "parentAnswerCode": "environmental",
        "link": "http://www.mayoclinic.com/health/cold-urticaria/DS01160"},
      {"id": "OTHR-17", "text": "Dog",
        "parentAnswerCode": "environmental",
        "link": "http://www.mayoclinic.com/health/pet-allergy/DS00859"},
      {"id": "OTHR-6", "text": "Dust Mites",
        "parentAnswerCode": "environmental",
        "link": "http://www.mayoclinic.com/health/dust-mites/DS00842"},
      {"id": "OTHR-7", "text": "Hay Fever",
        "parentAnswerCode": "environmental",
        "link": "http://www.nlm.nih.gov/medlineplus/hayfever.html"},
      {"id": "OTHR-1", "text": "Iodinated x-ray contrast",
        "parentAnswerCode": "environmental",
        "link": "http://www.nlm.nih.gov/medlineplus/ency/article/000819.htm"},
      {"id": "OTHR-2", "text": "Latex",
        "parentAnswerCode": "environmental",
        "link": "http://www.nlm.nih.gov/medlineplus/latexallergy.html"},
      {"id": "OTHR-8", "text": "Mold",
        "parentAnswerCode": "environmental",
        "link": "http://www.mayoclinic.com/health/mold-allergy/DS00773"},
      {"id": "OTHR-9", "text": "Nickel",
        "parentAnswerCode": "environmental",
        "link": "http://www.mayoclinic.com/health/nickel-allergy/DS00826"},
      {"id": "OTHR-10", "text": "Pet Dander",
        "parentAnswerCode": "environmental",
        "link": "http://www.mayoclinic.com/health/pet-allergy/DS00859"},
      {"id": "OTHR-19", "text": "Pollen",
        "parentAnswerCode": "environmental",
        "link": "http://www.nlm.nih.gov/medlineplus/hayfever.html"},
      {"id": "OTHR-11", "text": "Ragweed",
        "parentAnswerCode": "environmental",
        "link": "http://www.aafa.org/display.cfm?id=9&sub=19&cont=267"},
      {"id": "OTHR-12", "text": "Semen",
        "parentAnswerCode": "environmental",
        "link": "http://www.mayoclinic.com/health/semen-allergy/AN01225"},
      {"id": "OTHR-13", "text": "Sun",
        "parentAnswerCode": "environmental",
        "link": "http://www.mayoclinic.com/health/sun-allergy/DS01178"},
      {"id": "OTHR-3", "text": "Wasp, hornet, bee sting",
        "parentAnswerCode": "environmental",
        "link": "http://www.nlm.nih.gov/medlineplus/ency/article/000033.htm"},
      {"id": "medClass", "text": "Medication class allergies"},
      {"id": "DRUG-CLASS-1", "text": "ACE Inhibitors",
        "parentAnswerCode": "medClass",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "DRUG-CLASS-2", "text": "Aminoglycosides",
        "parentAnswerCode": "medClass",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "DRUG-CLASS-3", "text": "Antihistamines",
        "parentAnswerCode": "medClass",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "DRUG-CLASS-4", "text": "Benzodiazepines",
        "parentAnswerCode": "medClass",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "DRUG-CLASS-5", "text": "Beta Blockers",
        "parentAnswerCode": "medClass",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "DRUG-CLASS-6", "text": "Calcium Channel Blockers",
        "parentAnswerCode": "medClass",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "DRUG-CLASS-7", "text": "Cephalosporins",
        "parentAnswerCode": "medClass",
        "link": "http://www.nlm.nih.gov/medlineplus/ency/article/000819.htm"},
      {"id": "DRUG-CLASS-8", "text": "Diuretics",
        "parentAnswerCode": "medClass",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "DRUG-CLASS-9", "text": "H2 Blockers",
        "parentAnswerCode": "medClass",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "DRUG-CLASS-10", "text": "Insulins",
        "parentAnswerCode": "medClass",
        "link": "http://www.nlm.nih.gov/medlineplus/ency/article/000819.htm"},
      {"id": "DRUG-CLASS-11", "text": "Iodine Containing Medications",
        "parentAnswerCode": "medClass",
        "link": "http://www.nlm.nih.gov/medlineplus/ency/article/000819.htm"},
      {"id": "DRUG-CLASS-12", "text": "Local Anesthetics",
        "parentAnswerCode": "medClass",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "DRUG-CLASS-13", "text": "Macrolides (like Erythromycin)",
        "parentAnswerCode": "medClass",
        "link": "http://www.nlm.nih.gov/medlineplus/ency/article/000819.htm"},
      {"id": "DRUG-CLASS-14", "text": "Muscle Relaxants, Skeletal",
        "parentAnswerCode": "medClass",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "DRUG-CLASS-15", "text": "Narcotic Analgesics",
        "parentAnswerCode": "medClass",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "DRUG-CLASS-16", "text": "Nonsteroidal Anti Inflam. Agents (NSAID)",
        "parentAnswerCode": "medClass",
        "link": "http://www.mayoclinic.com/health/aspirin-allergy/AN01467/METHOD=print"},
      {"id": "DRUG-CLASS-24", "text": "Penicillin and Derivatives",
        "parentAnswerCode": "medClass",
        "link": "http://www.mayoclinic.com/print/penicillin-allergy/DS00620/DSECTION=all&METHOD=print"},
      {"id": "DRUG-CLASS-17", "text": "Phenothiazines",
        "parentAnswerCode": "medClass",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "DRUG-CLASS-18", "text": "Proton Pump Inhibitors",
        "parentAnswerCode": "medClass",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "DRUG-CLASS-19", "text": "Quinolone Antibiotics",
        "parentAnswerCode": "medClass",
        "link": "http://www.nlm.nih.gov/medlineplus/ency/article/000819.htm"},
      {"id": "DRUG-CLASS-20", "text": "Serotonin Re-Uptake Inhibitors",
        "parentAnswerCode": "medClass",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "DRUG-CLASS-21", "text": "Statins",
        "parentAnswerCode": "medClass",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "DRUG-CLASS-22", "text": "Sulfa Drugs",
        "parentAnswerCode": "medClass",
        "link": "http://www.mayoclinic.com/health/sulfa-allergy/AN01565/METHOD=print"},
      {"id": "DRUG-CLASS-23", "text": "Tetracycline",
        "parentAnswerCode": "medClass",
        "link": "http://www.nlm.nih.gov/medlineplus/ency/article/000819.htm"},
      {"id": "medication", "text": "Medication allergies"},
      {"id": "MED-57", "text": "ALEVE (Naproxen)",
        "parentAnswerCode": "medication",
        "link": "http://www.mayoclinic.com/health/aspirin-allergy/AN01467/METHOD=print"},
      {"id": "MED-2", "text": "AMBIEN (Zolpedem)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "MED-97", "text": "Amoxicillin",
        "parentAnswerCode": "medication",
        "link": "http://www.mayoclinic.com/print/penicillin-allergy/DS00620/DSECTION=all&METHOD=print"},
      {"id": "MED-6", "text": "Aspirin (ASA)",
        "parentAnswerCode": "medication",
        "link": "http://www.mayoclinic.com/health/aspirin-allergy/AN01467/METHOD=print"},
      {"id": "MED-7", "text": "ATIVAN  (Lorazapam)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/ency/article/000819.htm"},
      {"id": "MED-8", "text": "ATROVENT  (Ipartropium)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "MED-55", "text": "AVINZA (Morphine)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "MED-9", "text": "Bacitracin",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/ency/article/000819.htm"},
      {"id": "MED-10", "text": "BACTRIM  (Sulfamethoxazol/trimethaprim)",
        "parentAnswerCode": "medication",
        "link": "http://www.mayoclinic.com/health/sulfa-allergy/AN01565/METHOD=print"},
      {"id": "MED-11", "text": "BENADRYL  (Diphenhydramine )",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "MED-13", "text": "BUMEX  (Bumetanide)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "MED-16", "text": "CARDIZEM  (Diltizzam)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "MED-99", "text": "CEFZIL (Cefprozil)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "MED-18", "text": "CIPROFLOXACIN  (Cipro)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/ency/article/000819.htm"},
      {"id": "MED-19", "text": "Codeine",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "MED-20", "text": "COLACE (Docusate Sodium)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "MED-21", "text": "COMPAZINE (Prochlorperazine Maleate)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "MED-22", "text": "COUMADIN (Warfarin)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "MED-23", "text": "DALMANE  (Flurazepam)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "MED-52", "text": "DEMEROL (Meperidine)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "MED-88", "text": "DEPAKOTE ER (Valproic Acid)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/ency/article/000819.htm"},
      {"id": "MED-26", "text": "DILANTIN (Phenytoin)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/ency/article/000819.htm"},
      {"id": "MED-28", "text": "DULCOLAX (Bisacodyl)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "MED-29", "text": "E-MYCIN (Erythromycin)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/ency/article/000819.htm"},
      {"id": "MED-30", "text": "GASTROGRAFIN(Diatrizoate Meglumine)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/ency/article/000819.htm"},
      {"id": "MED-31", "text": "GLUCOPHAGE (Metformin)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "MED-32", "text": "HALCION (Triazolam)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/ency/article/000819.htm"},
      {"id": "MED-33", "text": "HALDOL (Haloperidol)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/ency/article/000819.htm"},
      {"id": "MED-35", "text": "HUMALIN (human insulin)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/ency/article/000819.htm"},
      {"id": "MED-37", "text": "IMDUR (Isosorbide)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "MED-64", "text": "ISONIAZID (Isoniazide)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/ency/article/000819.htm"},
      {"id": "MED-41", "text": "KAYEVELATE (Sodium Polystyrene Sulfonate)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "MED-42", "text": "KLONOPIN (Clonazepam)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/ency/article/000819.htm"},
      {"id": "MED-43", "text": "Lactose",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/ency/article/000276.htm"},
      {"id": "MED-44", "text": "LASIX (Furosemide)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "MED-45", "text": "LEVAQUIN (Levofloxacin)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/ency/article/000819.htm"},
      {"id": "MED-46", "text": "LIBRIUM (Chlordiazepoxide)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "MED-47", "text": "Lidocaine, Local",
        "parentAnswerCode":  "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "MED-48", "text": "LIPITOR (Atorvastatin)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "MED-49", "text": "LOPRESSOR (Metroprolol)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "MED-50", "text": "LOVENOX (Enoxaparin)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "MED-51", "text": "MELLARIL (Thioridazine)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "MED-36", "text": "MOTRIN/ADVIL (Ibuprofen)",
        "parentAnswerCode": "medication",
        "link": "http://www.mayoclinic.com/health/aspirin-allergy/AN01467/METHOD=print"},
      {"id": "MED-59", "text": "NORVASC (Amlodipine)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "MED-98", "text": "OMNICEF (Cefdinir)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/ency/article/000819.htm"},
      {"id": "MED-96", "text": "Penicillin",
        "parentAnswerCode": "medication",
        "link": "http://www.mayoclinic.com/print/penicillin-allergy/DS00620/DSECTION=all&METHOD=print"},
      {"id": "MED-61", "text": "PEPCID (Famotidine)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "MED-62", "text": "PERMITIL (Fluphenazine)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "MED-65", "text": "PLAVIX (Clopidogrel)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "MED-67", "text": "PREVACID (Lansoprazole)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "MED-68", "text": "PROLIXIN (Fluphenazine)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "MED-70", "text": "REGLAN (Metoclopramide)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "MED-71", "text": "RESTORIL (Temazepam)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "MED-53", "text": "ROBAXIN (Methocarbamol)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "MED-72", "text": "SENOKOT (Senna)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "MED-73", "text": "SERAX (Oxazepam)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/ency/article/000819.htm"},
      {"id": "MED-74", "text": "SERENTIL (Mesoridazine)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "MED-66", "text": "SLOW-K (Potassium)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "MED-75", "text": "SOLU MEDROL (Methylprednisolone )",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "MED-77", "text": "STELAZINE (Trifluoperazine)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "MED-79", "text": "SYNTHROID (Thyroxin)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "MED-15", "text": "TEGRETOL (Carbamazepine)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/ency/article/000819.htm"},
      {"id": "MED-82", "text": "THORAZINE (Chlorpromazine)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "MED-83", "text": "TOPROL (Metoprolol)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "MED-84", "text": "TRANXENE (Clorazepate)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/ency/article/000819.htm"},
      {"id": "MED-85", "text": "TRILAFON (Perphenazie)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "MED-86", "text": "TYLENOL (Acetaminophen)",
        "parentAnswerCode": "medication",
        "link": "http://www.mayoclinic.com/health/aspirin-allergy/AN01467/METHOD=print"},
      {"id": "MED-25", "text": "VALIUM (Diastat)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/ency/article/000819.htm"},
      {"id": "MED-87", "text": "VALIUM (Diazepam)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/ency/article/000819.htm"},
      {"id": "MED-89", "text": "VASOTEC (Enalapril)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "MED-90", "text": "VITAMIN K1 (Phytonadione)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "MED-91", "text": "XANAX (Alprazolam)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/ency/article/000819.htm"},
      {"id": "MED-92", "text": "ZAROXOLYN (Metolazone)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "MED-93", "text": "ZOLOFT (Sertraline)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"},
      {"id": "MED-94", "text": "ZOSYN (Piperacillin/Tazobactam)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/ency/article/000819.htm"},
      {"id": "MED-95", "text": "ZYPREXA (Olanzapine)",
        "parentAnswerCode": "medication",
        "link": "http://www.nlm.nih.gov/medlineplus/drugreactions.html"}
    ]

    let result = searchTerm.length == 0 ? searchOptions : searchOptions.filter((v) => v['text'].toLowerCase().indexOf(searchTerm.toLowerCase()) > -1).slice(0, 10)
    return of(result)
  }

  //see https://lhcforms.nlm.nih.gov/phr.json
  searchAllergyReaction(searchTerm: string): Observable<NlmSearchResults[]> {
    let searchOptions:NlmSearchResults[] = [
      {"id": "AL-REACT-19", "text": "Anaphylaxis"},
      {"id": "AL-REACT-1", "text": "Stomach cramps and/or pain"},
      {"id": "AL-REACT-5", "text": "Diarrhea and/or vomiting"},
      {"id": "AL-REACT-13", "text": "Lip, tongue and/or throat swelling"},
      {"id": "AL-REACT-21", "text": "Eye swelling, itching and/or watering"},
      {"id": "AL-REACT-4", "text": "Coughing and/or wheezing"},
      {"id": "AL-REACT-6", "text": "Trouble breathing"},
      {"id": "AL-REACT-15", "text": "Sneezing or stuffy nose"},
      {"id": "AL-REACT-9", "text": "Hives and/or itching"},
      {"id": "AL-REACT-20", "text": "Eczema or other rash"},
      {"id": "AL-REACT-23", "text": "Loss of consciousness"},
      {"id": "AL-REACT-11", "text": "Confusion"},
      {"id": "AL-REACT-7", "text": "Dizziness"},
      {"id": "AL-REACT-25", "text": "Rapid pulse"},
      {"id": "AL-REACT-8", "text": "Headache"}
    ]
    let result = searchTerm.length == 0 ? searchOptions : searchOptions.filter((v) => v['text'].toLowerCase().indexOf(searchTerm.toLowerCase()) > -1).slice(0, 10)
    return of(result)
  }
  //see https://lhcforms.nlm.nih.gov/phr.json
  searchVaccine(searchTerm: string): Observable<NlmSearchResults[]> {
    let searchOptions:NlmSearchResults[] = [
      {"id": "adolescentAdult", "text": "Adolescent/Adult"},
      {"id": "118", "text": "Cervarix (Human papilloma virus - bivalent)",
        "parentAnswerCode": "adolescentAdult"},
      {"id": "62", "text": "Gardasil (Human papilloma virus - quadrivalent)",
        "parentAnswerCode": "adolescentAdult"},
      {"id": "114", "text": "Meningococcal (MCV4)",
        "parentAnswerCode": "adolescentAdult"},
      {"id": "33", "text": "Pneumococcal 23 (PPSV, pneumonia vaccine)",
        "parentAnswerCode": "adolescentAdult"},
      {"id": "115", "text": "Tetanus/Diphtheria/Pertussis (Tdap)",
        "parentAnswerCode": "adolescentAdult"},
      {"id": "9", "text": "Tetanus/Diphtheria (Td)",
        "parentAnswerCode": "adolescentAdult"},
      {"id": "121", "text": "Zoster (Shingles)",
        "parentAnswerCode": "adolescentAdult"},
      {"id": "childhood", "text": "Childhood"},
      {"id": "20", "text": "Diphtheria/Tetanus/Pertussis (DTaP)",
        "parentAnswerCode": "childhood"},
      {"id": "17", "text": "Haemophilus influenzae type b (Hib)",
        "parentAnswerCode": "childhood"},
      {"id": "85", "text": "Hepatitis A (pediatric)",
        "parentAnswerCode": "childhood"},
      {"id": "45", "text": "Hepatitis B", "parentAnswerCode": "childhood"},
      {"id": "3", "text": "Measles/Mumps/Rubella (MMR)",
        "parentAnswerCode": "childhood"},
      {"id": "94", "text": "Measles/Mumps/Rubella-Varicella (MMRV)",
        "parentAnswerCode": "childhood"},
      {"id": "133", "text": "Pneumococcal 13 (Prevnar13)",
        "parentAnswerCode": "childhood"},
      {"id": "33", "text": "Pneumococcal 23 (for children at high risk)",
        "parentAnswerCode": "childhood"},
      {"id": "10", "text": "Polio, injected (IPV)",
        "parentAnswerCode": "childhood"},
      {"id": "122", "text": "Rotavirus", "parentAnswerCode": "childhood"},
      {"id": "21", "text": "Varicella (Chickenpox)",
        "parentAnswerCode": "childhood"},
      {"id": "50", "text": "DTaP-Hib combination",
        "parentAnswerCode": "childhood"},
      {"id": "130", "text": "DTaP-IPV combination",
        "parentAnswerCode": "childhood"},
      {"id": "110", "text": "DTaP-IPV-Hep B combination",
        "parentAnswerCode": "childhood"},
      {"id": "120", "text": "DTaP-IPV-Hib combination",
        "parentAnswerCode": "childhood"},
      {"id": "104", "text": "Hepatitis A-Hepatitis B combination",
        "parentAnswerCode": "childhood"},
      {"id": "51", "text": "Hib-Hepatitis B combination",
        "parentAnswerCode": "childhood"},
      {"id": "flu", "text": "Influenza"},
      {"id": "141", "text": "Influenza, injected (Flu)",
        "parentAnswerCode": "flu"},
      {"id": "140", "text": "Influenza, injected, preservative-free (Flu)",
        "parentAnswerCode": "flu"},
      {"id": "111", "text": "Influenza, intranasal (FluMist)",
        "parentAnswerCode": "flu"},
      {"id": "135", "text": "Influenza, high-dose (Flu, for people 65 and older)",
        "parentAnswerCode": "flu"},
      {"id": "travel", "text": "Travel"},
      {"id": "85", "text": "Hepatitis A (adult)",
        "parentAnswerCode": "travel"},
      {"id": "45", "text": "Hepatitis B (adult)",
        "parentAnswerCode": "travel"},
      {"id": "134", "text": "Japanese encephalitis (Ixiaro, for people > 16 years old)",
        "parentAnswerCode": "travel"},
      {"id": "41", "text": "Typhoid, injected", "parentAnswerCode": "travel"},
      {"id": "25", "text": "Typhoid, oral", "parentAnswerCode": "travel"},
      {"id": "18", "text": "Rabies", "parentAnswerCode": "travel"},
      {"id": "37", "text": "Yellow fever (YF)",
        "parentAnswerCode": "travel"},
      {"id": "uncommon", "text": "Not commonly used or not available in U.S.",
        "parentAnswerCode": ""},
      {"id": "24", "text": "Anthrax", "parentAnswerCode": "uncommon"},
      {"id": "28", "text": "Diphtheria/Tetanus (DT)",
        "parentAnswerCode": "uncommon"},
      {"id": "39", "text": "Japanese encephalitis (JE-VAX, not available since May 2011)",
        "parentAnswerCode": "uncommon"},
      {"id": "66", "text": "Lyme disease", "parentAnswerCode": "uncommon"},
      {"id": "5", "text": "Measles", "parentAnswerCode": "uncommon"},
      {"id": "7", "text": "Mumps", "parentAnswerCode": "uncommon"},
      {"id": "100", "text": "Pneumococcal 7 (replaced by Pneumococcal 13 in 2010)",
        "parentAnswerCode": "uncommon"},
      {"id": "2", "text": "Polio, oral (OPV)",
        "parentAnswerCode": "uncommon"},
      {"id": "6", "text": "Rubella", "parentAnswerCode": "uncommon"},
      {"id": "35", "text": "Tetanus (TT)",
        "parentAnswerCode": "uncommon"},
      {"id": "19", "text": "Tuberculosis (BCG)",
        "parentAnswerCode": "uncommon"},
      {"id": "75", "text": "Vaccinia (smallpox)",
        "parentAnswerCode": "uncommon"}
    ]
    let result = searchTerm.length == 0 ? searchOptions : searchOptions.filter((v) => v['text'].toLowerCase().indexOf(searchTerm.toLowerCase()) > -1).slice(0, 10)
    return of(result)
  }

  //https://clinicaltables.nlm.nih.gov/api/procedures/v3/search?terms=xxx
  searchProcedure(searchTerm: string): Observable<NlmSearchResults[]> {
    let queryParams = {
      'terms':searchTerm,
      'df':'key_id,consumer_name,info_link_data,term_icd9_code'
    }
    return this._httpClient.get<any>(`${this.nlm_clinical_table_search_endpoint}/procedures/v3/search`, {params: queryParams})
      .pipe(
        map((response) => {

          return response[3].map((item):NlmSearchResults => {
            return {
              id: item[0],
              text: item[1],
              link: item[2].split(',')[0], //link includes a description at the end, comma separated.
              identifier: [{
                system: 'http://hl7.org/fhir/sid/icd-9-cm',
                code: item[3].split(',')[0],
                display: item[1]
              }]
            }
          })
        })
      )
  }

  //see https://lhcforms.nlm.nih.gov/phr.json
  //see https://build.fhir.org/valueset-provider-taxonomy.html
  // ideally we'd use http://www.hl7.org/fhir/valueset-performer-role.html
  // but the LHC api returns NUCC codes, not the SNOMED codes, which would be confusing.
  searchMedicalContactIndividualProfession(searchTerm: string): Observable<NlmSearchResults[]> {
    let searchOptions: NlmSearchResults[] = [
      {
        id: "207K00000X",
        identifier: [{
          code: "207K00000X",
          display: "Allergy & Immunology Physician",
          system: "http://nucc.org/provider-taxonomy"
        }],
        text: "Allergy & Immunology Physician"
      },
      {
        id: "103TC0700X",
        identifier: [{
          code: "103TC0700X",
          display: "Clinical Psychologist",
          system: "http://nucc.org/provider-taxonomy"
        }],
        text: "Clinical Psychologist"
      },
      {
        id: "122300000X",
        identifier: [{
          code: "122300000X",
          display: "Dentist",
          system: "http://nucc.org/provider-taxonomy"
        }],
        text: "Dentist"
      },
      {
        id: "207N00000X",
        identifier: [{
          code: "207N00000X",
          display: "Dermatology Physician",
          system: "http://nucc.org/provider-taxonomy"
        }],
        text: "Dermatology Physician"
      },
      {
        id: "207Y00000X",
        identifier: [{
          code: "207Y00000X",
          display: "Otolaryngology Physician",
          system: "http://nucc.org/provider-taxonomy"
        }],
        text: "Otolaryngology Physician (Ear, Nose, Throat/ENT)"
      },
      {
        id: "207Q00000X",
        identifier: [{
          code: "207Q00000X",
          display: "Family Medicine Physician",
          system: "http://nucc.org/provider-taxonomy"
        }],
        text: "Family Medicine Physician"
      },
      {
        id: "207RG0100X",
        identifier: [{
          code: "207RG0100X",
          display: "Gastroenterology Physician",
          system: "http://nucc.org/provider-taxonomy"
        }],
        text: "Gastroenterology Physician"
      },
      {
        id: "207RH0000X",
        identifier: [{
          code: "207RH0000X",
          display: "Hematology (Internal Medicine) Physician",
          system: "http://nucc.org/provider-taxonomy"
        }],
        text: "Hematology (Internal Medicine) Physician"
      },
      {
        id: "207R00000X",
        identifier: [{
          code: "207R00000X",
          display: "Internal Medicine Physician",
          system: "http://nucc.org/provider-taxonomy"
        }],
        text: "Internal Medicine Physician"
      },
      {
        id: "332B00000X",
        identifier: [{
          code: "332B00000X",
          display: "Durable Medical Equipment & Medical Supplies",
          system: "http://nucc.org/provider-taxonomy"
        }],
        text: "Durable Medical Equipment & Medical Supplies"
      },
      {
        id: "207RN0300X",
        identifier: [{
          code: "207RN0300X",
          display: "Nephrology Physician",
          system: "http://nucc.org/provider-taxonomy"
        }],
        text: "Nephrology Physician"
      },
      {
        id: "2084N0400X",
        identifier: [{
          code: "2084N0400X",
          display: "Neurology Physician",
          system: "http://nucc.org/provider-taxonomy"
        }],
        text: "Neurology Physician"
      },
      {
        id: "163W00000X",
        identifier: [{
          code: "163W00000X",
          display: "Registered Nurse",
          system: "http://nucc.org/provider-taxonomy"
        }],
        text: "Registered Nurse"
      },
      {
        id: "363L00000X",
        identifier: [{
          code: "363L00000X",
          display: "Nurse Practitioner",
          system: "http://nucc.org/provider-taxonomy"
        }],
        text: "Nurse Practitioner"
      },
      {
        id: "207V00000X",
        identifier: [{
          code: "207V00000X",
          display: "Obstetrics & Gynecology Physician",
          system: "http://nucc.org/provider-taxonomy"
        }],
        text: "Obstetrics & Gynecology Physician"
      },
      {
        id: "225X00000X",
        identifier: [{
          code: "225X00000X",
          display: "Occupational Therapist",
          system: "http://nucc.org/provider-taxonomy"
        }],
        text: "Occupational Therapist"
      },
      {
        id: "207RH0003X",
        identifier: [{
          code: "207RH0003X",
          display: "Hematology & Oncology Physician",
          system: "http://nucc.org/provider-taxonomy"
        }],
        text: "Hematology & Oncology Physician"
      },
      {
        id: "207W00000X",
        identifier: [{
          code: "207W00000X",
          display: "Ophthalmology Physician",
          system: "http://nucc.org/provider-taxonomy"
        }],
        text: "Ophthalmology Physician"
      },
      {
        id: "152W00000X",
        identifier: [{
          code: "152W00000X",
          display: "Optometrist",
          system: "http://nucc.org/provider-taxonomy"
        }],
        text: "Optometrist"
      },
      {
        id: "1223X0400X",
        identifier: [{
          code: "1223X0400X",
          display: "Orthodontics and Dentofacial Orthopedic Dentist",
          system: "http://nucc.org/provider-taxonomy"
        }],
        text: "Orthodontics and Dentofacial Orthopedic Dentist"
      },
      {
        id: "208000000X",
        identifier: [{
          code: "208000000X",
          display: "Pediatrics Physician",
          system: "http://nucc.org/provider-taxonomy"
        }],
        text: "Pediatrics Physician"
      },
      {
        id: "208100000X",
        identifier: [{
          code: "208100000X",
          display: "Physical Medicine & Rehabilitation Physician",
          system: "http://nucc.org/provider-taxonomy"
        }],
        text: "Physical Medicine & Rehabilitation Physician"
      },
      {
        id: "225100000X",
        identifier: [{
          code: "225100000X",
          display: "Physical Therapist",
          system: "http://nucc.org/provider-taxonomy"
        }],
        text: "Physical Therapist"
      },
      {
        id: "208200000X",
        identifier: [{
          code: "208200000X",
          display: "Plastic Surgery Physician",
          system: "http://nucc.org/provider-taxonomy"
        }],
        text: "Plastic Surgery Physician"
      },
      {
        id: "213E00000X",
        identifier: [{
          code: "213E00000X",
          display: "Podiatrist",
          system: "http://nucc.org/provider-taxonomy"
        }],
        text: "Podiatrist"
      },
      {
        id: "2084P0800X",
        identifier: [{
          code: "2084P0800X",
          display: "Psychiatry Physician",
          system: "http://nucc.org/provider-taxonomy"
        }],
        text: "Psychiatry Physician"
      },
      {
        id: "207RP1001X",
        identifier: [{
          code: "207RP1001X",
          display: "Pulmonary Disease Physician",
          system: "http://nucc.org/provider-taxonomy"
        }],
        text: "Pulmonary Disease Physician"
      },
      {
        id: "207RR0500X",
        identifier: [{
          code: "207RR0500X",
          display: "Rheumatology Physician",
          system: "http://nucc.org/provider-taxonomy"
        }],
        text: "Rheumatology Physician"
      },
      {
        id: "104100000X",
        identifier: [{
          code: "104100000X",
          display: "Social Worker",
          system: "http://nucc.org/provider-taxonomy"
        }],
        text: "Social Worker"
      },
      {
        id: "235500000X",
        identifier: [{
          code: "235500000X",
          display: "Speech/Language/Hearing Specialist/Technologist",
          system: "http://nucc.org/provider-taxonomy"
        }],
        text: "Speech/Language/Hearing Specialist/Technologist"
      },
      {
        id: "208600000X",
        identifier: [{
          code: "208600000X",
          display: "Surgery Physician",
          system: "http://nucc.org/provider-taxonomy"
        }],
        text: "Surgery Physician"
      },
      {
        id: "208800000X",
        identifier: [{
          code: "208800000X",
          display: "Urology Physician",
          system: "http://nucc.org/provider-taxonomy"
        }],
        text: "Urology Physician"
      }
    ]
    let result = searchTerm.length == 0 ? searchOptions : searchOptions.filter((v) => v['text'].toLowerCase().indexOf(searchTerm.toLowerCase()) > -1).slice(0, 10)
    return of(result)
  }

  searchMedicalContactIndividual(searchTerm: string): Observable<NlmSearchResults[]> {
    let queryParams = {
      'terms':searchTerm,
      'df':'NPI,name.full,provider_type,addr_practice,licenses.taxonomy.code'
    }

    //https://clinicaltables.nlm.nih.gov/api/npi_idv/v3/search?df=&terms=xx
    return this._httpClient.get<any>(`${this.nlm_clinical_table_search_endpoint}/npi_idv/v3/search`, {params: queryParams})
      .pipe(
        map((response) => {
          return response[3].map((item):NlmSearchResults => {
            let addr_practice = JSON.parse(item[3])
            return {
              id: item[0],
              identifier: [{
                system: 'http://hl7.org/fhir/sid/us-npi',
                value: item[0],
                type: {
                  coding: [
                    {
                      system: "http://terminology.hl7.org/CodeSystem/v2-0203",
                      code: "NPI"
                    }
                  ]
                }
              }],
              text: item[1],
              subtext: `${item[2]} - ${addr_practice.state}`,
              provider_type: {
                id: item[4],
                text: item[2],
                identifier: [{
                  system: 'http://nucc.org/provider-taxonomy',
                  code: item[4],
                  display: item[2],
                }]
              },
              provider_address: {
                line1: addr_practice.line1,
                line2: addr_practice.line2,
                city: addr_practice.city,
                state: addr_practice.state,
                zip: addr_practice.zip,
                country: addr_practice.country,
              },
              provider_fax: addr_practice.fax,
              provider_phone: addr_practice.phone,
            }
          })
        })
      )
  }


  // see http://terminology.hl7.org/CodeSystem/organization-type'
  searchMedicalContactOrganization(searchTerm: string): Observable<NlmSearchResults[]> {
    let queryParams = {
      'terms':searchTerm,
      'df':'NPI,name.full,provider_type,addr_practice,licenses.taxonomy.code'
    }

    //https://clinicaltables.nlm.nih.gov/api/npi_org/v3/search?df=&terms=xx
    return this._httpClient.get<any>(`${this.nlm_clinical_table_search_endpoint}/npi_org/v3/search`, {params: queryParams})
      .pipe(
        map((response) => {

          return response[3].map((item):NlmSearchResults => {
            let addr_practice = JSON.parse(item[3])
            return {
              id: item[0],
              identifier: [{
                system: 'http://hl7.org/fhir/sid/us-npi',
                value: item[0],
                type: {
                  coding: [
                    {
                      system: "http://terminology.hl7.org/CodeSystem/v2-0203",
                      code: "NPI"
                    }
                  ]
                }
              }],
              text: item[1],
              subtext: `${item[2]} - ${addr_practice.state}`,
              provider_type: {
                id: item[4],
                text: item[2],
                identifier: [{
                  system: 'http://nucc.org/provider-taxonomy',
                  code: item[4],
                  display: item[2],
                }]
              },
              provider_address: {
                line1: addr_practice.line1,
                line2: addr_practice.line2,
                city: addr_practice.city,
                state: addr_practice.state,
                zip: addr_practice.zip,
                country: addr_practice.country,
              },
              provider_fax: addr_practice.fax,
              provider_phone: addr_practice.fax,
            }
          })
        })
      )
  }

  searchMedicalContactOrganizationType(searchTerm: string): Observable<NlmSearchResults[]> {
    let searchOptions: NlmSearchResults[] = [
      {
        id: "261Q00000X",
        identifier: [{
          code: "261Q00000X",
          display: "Clinic/Center",
          system: "http://nucc.org/provider-taxonomy"
        }],
        text: "Clinic/Center"
      },
      {
        id: "261QC1500X",
        identifier: [{
          code: "261QC1500X",
          display: "Community Health Clinic/Center",
          system: "http://nucc.org/provider-taxonomy"
        }],
        text: "Community Health Clinic/Center"
      },
      {
        id: "261QM1100X",
        identifier: [{
          code: "261QM1100X",
          display: "Military/U.S. Coast Guard Outpatient Clinic/Center",
          system: "http://nucc.org/provider-taxonomy"
        }],
        text: "Military/U.S. Coast Guard Outpatient Clinic/Center"
      },
      {
        id: "261QP0904X",
        identifier: [{
          code: "261QP0904X",
          display: "Federal Public Health Clinic/Center",
          system: "http://nucc.org/provider-taxonomy"
        }],
        text: "Federal Public Health Clinic/Center"
      },
      {
        id: "261QP2000X",
        identifier: [{
          code: "261QP2000X",
          display: "Physical Therapy Clinic/Center",
          system: "http://nucc.org/provider-taxonomy"
        }],
        text: "Physical Therapy Clinic/Center"
      },
      {
        id: "261QP2300X",
        identifier: [{
          code: "261QP2300X",
          display: "Primary Care Clinic/Center",
          system: "http://nucc.org/provider-taxonomy"
        }],
        text: "Primary Care Clinic/Center"
      },
      {
        id: "261QV0200X",
        identifier: [{
          code: "261QV0200X",
          display: "VA Clinic/Center",
          system: "http://nucc.org/provider-taxonomy"
        }],
        text: "VA Clinic/Center"
      },
      {
        id: "282N00000X",
        identifier: [{
          code: "282N00000X",
          display: "General Acute Care Hospital",
          system: "http://nucc.org/provider-taxonomy"
        }],
        text: "General Acute Care Hospital"
      },
      {
        id: "310400000X",
        identifier: [{
          code: "310400000X",
          display: "Assisted Living Facility",
          system: "http://nucc.org/provider-taxonomy"
        }],
        text: "Assisted Living Facility"
      },
      {
        id: "ins",
        identifier: [{
          code: "ins",
          display: "Insurance Company",
          system: "http://terminology.hl7.org/CodeSystem/organization-type"
        }],
        text: "Insurance Company"
      },
      {
        id: "ins",
        identifier: [{
          code: "ins",
          display: "Insurance Company",
          system: "http://terminology.hl7.org/CodeSystem/organization-type"
        }],
        text: "Insurance Company"
      }
    ]
    let result = searchTerm.length == 0 ? searchOptions : searchOptions.filter((v) => v['text'].toLowerCase().indexOf(searchTerm.toLowerCase()) > -1).slice(0, 10)
    return of(result)
  }

  //https://www.devdays.com/wp-content/uploads/2021/12/Jim-Steel-FHIR-Terminology-Service-APIs-DevDays-2019-Redmond.pdf
  searchCountries(searchTerm: string): Observable<NlmSearchResults[]> {

    //https://tx.fhir.org/r4/ValueSet/$expand?_format=json&filter=Canada&url=http://hl7.org/fhir/ValueSet/iso3166-1-2
    let queryParams = {
      '_format': 'json',
      'filter':searchTerm,
      'url': 'http://hl7.org/fhir/ValueSet/iso3166-1-2'
    }

    return this._httpClient.get<any>(`https://tx.fhir.org/r4/ValueSet/$expand`, {params: queryParams})
      .pipe(
        map((response) => {

          return (response.expansion.contains || []).map((valueSetItem):NlmSearchResults => {
            return {
              id: valueSetItem.code,
              identifier: [valueSetItem],
              text: valueSetItem.display,
            }
          })
        })
      )
  }

  searchWikipediaType(searchTerm: string): Observable<NlmSearchResults[]> {
    let queryParams = {
      'action': 'opensearch',
      'format': 'json',
      'origin': '*',
      'search':searchTerm
    }
    return this._httpClient.get<any>(`${this.wikipedia_search_endpoint}/procedures/v3/search`)
      .pipe(
        map((response: NlmSearchResults[]) => {
          return response
        })
      );
  }


  searchAttachmentFileType(searchTerm: string): Observable<NlmSearchResults[]> {
    let searchOptions: NlmSearchResults[] = [
      {
        id: "application/json",
        text: "Document - JSON"
      },
      {
        id: "text/markdown",
        text: "Document - Markdown"
      },
      {
        id: "application/pdf",
        text: "Document - PDF"
      },
      {
        id: "application/dicom",
        text: "Image - DICOM"
      },
      {
        id: "text/csv",
        text: "Document - CSV"
      },
      {
        id: "image/png",
        text: "Image - PNG"
      },
      {
        id: "image/jpeg",
        text: "Image - JPEG"
      },
      {
        id: "text/plain",
        text: "Document - Plain Text"
      },

    ]
    let result = searchTerm.length == 0 ? searchOptions : searchOptions.filter((v) => v['text'].toLowerCase().indexOf(searchTerm.toLowerCase()) > -1).slice(0, 10)
    return of(result)
  }

  //https://build.fhir.org/valueset-referenced-item-category.html
  searchAttachmentCategory(searchTerm: string): Observable<NlmSearchResults[]> {


    //https://tx.fhir.org/r4/ValueSet/$expand?_format=json&filter=Referral&url=http://hl7.org/fhir/ValueSet/document-classcodes
    let queryParams = {
      '_format': 'json',
      'filter':searchTerm,
      'url': 'http://hl7.org/fhir/ValueSet/document-classcodes'
    }

    return this._httpClient.get<any>(`https://tx.fhir.org/r4/ValueSet/$expand`, {params: queryParams})
      .pipe(
        map((response) => {

          return (response.expansion.contains || []).map((valueSetItem):NlmSearchResults => {
            return {
              id: valueSetItem.code,
              identifier: [valueSetItem],
              text: valueSetItem.display,
            }
          })
        })
      )

    // let searchOptions: NlmSearchResults[] = [
    //   {
    //     id: "image",
    //     identifier: [{
    //       code: "image",
    //       display: "Image",
    //       system: "http://terminology.hl7.org/CodeSystem/media-category"
    //     }],
    //     text: "Image"
    //   },
    //   {
    //     id: "11485-0",
    //     identifier: [{
    //       code: "11485-0",
    //       display: "Anesthesia records",
    //       system: "http://loinc.org"
    //     }],
    //     text: "Anesthesia records"
    //   },
    //   {
    //     id: "11488-4",
    //     identifier: [{
    //       code: "11488-4",
    //       display: "Consult note",
    //       system: "http://loinc.org"
    //     }],
    //     text: "Consult note"
    //   },
    //   {
    //     id: "11490-0",
    //     identifier: [{
    //       code: "11490-0",
    //       display: "Physician Discharge summary",
    //       system: "http://loinc.org"
    //     }],
    //     text: "Physician Discharge summary"
    //   },
    //   {
    //     id: "11502-2",
    //     identifier: [{
    //       code: "11502-2",
    //       display: "Laboratory report",
    //       system: "http://loinc.org"
    //     }],
    //     text: "Laboratory report"
    //   },
    //   {
    //     id: "11504-8",
    //     identifier: [{
    //       code: "11504-8",
    //       display: "Surgical operation note",
    //       system: "http://loinc.org"
    //     }],
    //     text: "Surgical operation note"
    //   },
    //   {
    //     id: "11506-3",
    //     identifier: [{
    //       code: "11506-3",
    //       display: "Progress note",
    //       system: "http://loinc.org"
    //     }],
    //     text: "Progress note"
    //   },
    //   {
    //     id: "11505-5",
    //     identifier: [{
    //       code: "11505-5",
    //       display: "Physician procedure note",
    //       system: "http://loinc.org"
    //     }],
    //     text: "Physician procedure note"
    //   },
    //   {
    //     id: "11524-6",
    //     identifier: [{
    //       code: "11524-6",
    //       display: "EKG study",
    //       system: "http://loinc.org"
    //     }],
    //     text: "EKG study"
    //   },
    //   {
    //     id: "11526-1",
    //     identifier: [{
    //       code: "11526-1",
    //       display: "Pathology study",
    //       system: "http://loinc.org"
    //     }],
    //     text: "Pathology study"
    //   },
    //   {
    //     id: "11527-9",
    //     identifier: [{
    //       code: "11527-9",
    //       display: "Psychiatry study",
    //       system: "http://loinc.org"
    //     }],
    //     text: "Psychiatry study"
    //   },
    //   {
    //     id: "11543-6",
    //     identifier: [{
    //       code: "11543-6",
    //       display: "Nursery records",
    //       system: "http://loinc.org"
    //     }],
    //     text: "Nursery records"
    //   },
    //   {
    //     id: "11543-6",
    //     identifier: [{
    //       code: "11543-6",
    //       display: "Nursery records",
    //       system: "http://loinc.org"
    //     }],
    //     text: "Nursery records"
    //   },
    //   {
    //     id: "15508-5",
    //     identifier: [{
    //       code: "15508-5",
    //       display: "Labor and delivery records",
    //       system: "http://loinc.org"
    //     }],
    //     text: "Labor and delivery records"
    //   },
    //   {
    //     id: "18682-5",
    //     identifier: [{
    //       code: "18682-5",
    //       display: "Ambulance records",
    //       system: "http://loinc.org"
    //     }],
    //     text: "Ambulance records"
    //   },
    //   {
    //     id: "18748-4",
    //     identifier: [{
    //       code: "18748-4",
    //       display: "Diagnostic imaging study",
    //       system: "http://loinc.org"
    //     }],
    //     text: "Diagnostic imaging study"
    //   },
    //   {
    //     id: "18761-7",
    //     identifier: [{
    //       code: "18761-7",
    //       display: "Transfer summary note",
    //       system: "http://loinc.org"
    //     }],
    //     text: "Transfer summary note"
    //   },
    //   {
    //     id: "18776-5",
    //     identifier: [{
    //       code: "18776-5",
    //       display: "Plan of care note",
    //       system: "http://loinc.org"
    //     }],
    //     text: "Plan of care note"
    //   },
    //   {
    //     id: "18776-5",
    //     identifier: [{
    //       code: "18776-5",
    //       display: "Plan of care note",
    //       system: "http://loinc.org"
    //     }],
    //     text: "Plan of care note"
    //   }
    // ]
    // let result = searchTerm.length == 0 ? searchOptions : searchOptions.filter((v) => v['text'].toLowerCase().indexOf(searchTerm.toLowerCase()) > -1).slice(0, 10)
    // return of(result)
  }

}
