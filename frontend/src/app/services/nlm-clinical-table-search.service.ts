import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Observable, of} from 'rxjs';

export interface NlmSearchResults {
  id: string
  text: string
  parentAnswerCode?: string
  link?: string
  icd9?: string
  icd10?: string
  provider_type?: string
  provider_address?: string
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
              icd10: item[3].split(',')[0], //link includes a description at the end, comma separated.
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
            })
          }
          return results
        })
      )
  }

  //see https://lhcforms.nlm.nih.gov/phr.json
  searchMedicationWhyStopped(searchTerm: string): Observable<NlmSearchResults[]> {
    let searchOptions: NlmSearchResults[] = [
      {"id": "STP-1", "text": "Finished the prescription"},
      {"id": "STP-2", "text": "Dose change"},
      {"id": "STP-3", "text": "Problem gone"},
      {"id": "STP-4", "text": "Replaced by better drug"},
      {"id": "STP-5", "text": "Could not tolerate side effects"},
      {"id": "STP-6", "text": "Didn't work"},
      {"id": "STP-7", "text": "Allergy"},
      {"id": "STP-8", "text": "Too expensive"},
      {"id": "STP-9", "text": "Not covered by insurance"},
      {"id": "STP-10","text": "I don't know"}
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
              icd9: item[3].split(',')[0]
            }
          })
        })
      )
  }
  //see https://lhcforms.nlm.nih.gov/phr.json
  searchMedicalContactType(searchTerm: string): Observable<NlmSearchResults[]> {
    let searchOptions: NlmSearchResults[] = [
      {"id": "ALLE", "text": "Allergist"},
      {"id": "CARD", "text": "Cardiologist"},
      {"id": "CLIN", "text": "Clinical psychologist"},
      {"id": "DENT", "text": "Dentist"},
      {"id": "DERM", "text": "Dermatologist"},
      {"id": "EAR", "text": "ENT"},
      {"id": "FP", "text": "Family practitioner"},
      {"id": "GI", "text": "Gastroenterologist"},
      {"id": "HEME", "text": "Hematologist"},
      {"id": "HOSP", "text": "Hospital"},
      {"id": "IMM", "text": "Immunologist"},
      {"id": "INTE", "text": "Internist"},
      {"id": "MEDI", "text": "Medical equipment supplier"},
      {"id": "NEPH", "text": "Nephrologist"},
      {"id": "NEUR", "text": "Neurologist"},
      {"id": "NURS", "text": "Nurse"},
      {"id": "NURSP", "text": "Nurse practitioner"},
      {"id": "NURSH", "text": "Nursing Home"},
      {"id": "OBGY", "text": "Obstetrician/Gynecologist"},
      {"id": "OT", "text": "Occupational therapist"},
      {"id": "ONC", "text": "Oncologist"},
      {"id": "OPHT", "text": "Ophthalmologist"},
      {"id": "OPTO", "text": "Optometrist"},
      {"id": "ODO", "text": "Orthodontist"},
      {"id": "ORTH", "text": "Orthopedist"},
      {"id": "PEDI", "text": "Pediatrician"},
      {"id": "PHAR", "text": "Pharmacy"},
      {"id": "PHMO", "text": "Pharmacy - mail order"},
      {"id": "PHAR24", "text": "Pharmacy- 24 hour"},
      {"id": "PMR", "text": "Physical medicine and rehabilitation (PM&R)"},
      {"id": "PT", "text": "Physical therapist"},
      {"id": "PLS", "text": "Plastic surgeon"},
      {"id": "POD", "text": "Podiatrist"},
      {"id": "PRIM", "text": "Primary care physician"},
      {"id": "PSYC", "text": "Psychiatrist"},
      {"id": "PULM", "text": "Pulmonologist"},
      {"id": "RHEU", "text": "Rheumatologist"},
      {"id": "SOCI", "text": "Social worker"},
      {"id": "SLT", "text": "Speech and language therapist"},
      {"id": "SURG", "text": "Surgeon"},
      {"id": "URGE", "text": "Urgent care facility"},
      {"id": "UROL", "text": "Urologist"}
    ]
    let result = searchTerm.length == 0 ? searchOptions : searchOptions.filter((v) => v['text'].toLowerCase().indexOf(searchTerm.toLowerCase()) > -1).slice(0, 10)
    return of(result)
  }


  searchMedicalContactIndividual(searchTerm: string): Observable<NlmSearchResults[]> {
    let queryParams = {
      'terms':searchTerm,
      'df':'NPI,name.full,provider_type,addr_practice.full'
    }

    //https://clinicaltables.nlm.nih.gov/api/npi_idv/v3/search?df=&terms=xx
    return this._httpClient.get<any>(`${this.nlm_clinical_table_search_endpoint}/npi_idv/v3/search`, {params: queryParams})
      .pipe(
        map((response) => {

          return response[3].map((item):NlmSearchResults => {
            return {
              id: item[0],
              text: item[1],
              provider_type: item[2],
              provider_address: item[3]
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

}
