import {Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {NlmTypeaheadComponent} from '../nlm-typeahead/nlm-typeahead.component';
import {HighlightModule} from 'ngx-highlightjs';
import {NgbActiveModal, NgbTooltipModule} from '@ng-bootstrap/ng-bootstrap';
import {NlmClinicalTableSearchService} from '../../services/nlm-clinical-table-search.service';
import {LabresultsQuestionnaire} from '../../models/fasten/labresults-questionnaire';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    NlmTypeaheadComponent,
    ReactiveFormsModule,
    FormsModule,
  ],
  selector: 'app-medical-record-wizard-add-lab-results',
  templateUrl: './medical-record-wizard-add-lab-results.component.html',
  styleUrls: ['./medical-record-wizard-add-lab-results.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MedicalRecordWizardAddLabResultsComponent implements OnInit {
  @Input() debugMode: boolean = false;

  @ViewChild('lhcForm', {read: ElementRef}) wcForm: ElementRef;
  format: 'R4' | 'STU3' = 'R4';

  newLabPanelTypeaheadForm: FormGroup

  options = {
    displayScoreWithAnswerText: false
  }
  // questionnaire = {"lformsVersion":"29.0.0","PATH_DELIMITER":"/","code":"55399-0","codeList":[{"code":"55399-0","display":"Diabetes tracking panel","system":"http://loinc.org"}],"identifier":null,"codeSystem":"http://loinc.org","name":"Diabetes tracking panel","type":"LOINC","template":"table","copyrightNotice":null,"items":[{"questionCode":"41653-7","localQuestionCode":null,"dataType":"REAL","header":false,"units":[{"name":"mg/dL","code":"mg/dL","system":"http://unitsofmeasure.org","default":false}],"codingInstructions":null,"copyrightNotice":null,"question":"Glucose BldC Glucomtr-mCnc","answers":null,"skipLogic":null,"restrictions":null,"defaultAnswer":null,"formatting":null,"calculationMethod":null,"linkId":"/41653-7","questionCodeSystem":"http://loinc.org","codeList":[{"code":"41653-7","display":"Glucose BldC Glucomtr-mCnc","system":"http://loinc.org"}],"questionCardinality":{"min":"1","max":"1"},"answerCardinality":{"min":"0","max":"1"},"unit":{"name":"mg/dL","code":"mg/dL","system":"http://unitsofmeasure.org","default":false}},{"questionCode":"2345-7","localQuestionCode":null,"dataType":"REAL","header":false,"units":[{"name":"mg/dL","code":"mg/dL","system":"http://unitsofmeasure.org","default":false}],"codingInstructions":null,"copyrightNotice":null,"question":"Glucose - lab","answers":null,"skipLogic":null,"restrictions":null,"defaultAnswer":null,"formatting":null,"calculationMethod":null,"linkId":"/2345-7","questionCodeSystem":"http://loinc.org","codeList":[{"code":"2345-7","display":"Glucose - lab","system":"http://loinc.org"}],"questionCardinality":{"min":"1","max":"1"},"answerCardinality":{"min":"0","max":"1"},"unit":{"name":"mg/dL","code":"mg/dL","system":"http://unitsofmeasure.org","default":false}},{"questionCode":"55420-4","localQuestionCode":null,"dataType":"CNE","header":false,"units":[{"name":"h","code":"h","system":"http://unitsofmeasure.org","default":false}],"codingInstructions":null,"copyrightNotice":null,"question":"Hours p meal Time Patient","answers":[{"label":null,"code":"LA11828-3","text":"1 hour","other":null,"system":"http://loinc.org"},{"label":null,"code":"LA11829-1","text":"2 hours","other":null,"system":"http://loinc.org"},{"label":null,"code":"LA11830-9","text":"3 hours","other":null,"system":"http://loinc.org"},{"label":null,"code":"LA11831-7","text":"Fasting","other":null,"system":"http://loinc.org"}],"skipLogic":null,"restrictions":null,"defaultAnswer":null,"formatting":null,"calculationMethod":null,"linkId":"/55420-4","questionCodeSystem":"http://loinc.org","codeList":[{"code":"55420-4","display":"Hours p meal Time Patient","system":"http://loinc.org"}],"displayControl":{"answerLayout":{"type":"COMBO_BOX","columns":"0"}},"questionCardinality":{"min":"1","max":"1"},"answerCardinality":{"min":"0","max":"1"}},{"questionCode":"4548-4","localQuestionCode":null,"dataType":"REAL","header":false,"units":[{"name":"%","code":"%","system":"http://unitsofmeasure.org","default":false}],"codingInstructions":null,"copyrightNotice":null,"question":"HbA1c MFr Bld","answers":null,"skipLogic":null,"restrictions":null,"defaultAnswer":null,"formatting":null,"calculationMethod":null,"linkId":"/4548-4","questionCodeSystem":"http://loinc.org","codeList":[{"code":"4548-4","display":"HbA1c MFr Bld","system":"http://loinc.org"}],"questionCardinality":{"min":"1","max":"1"},"answerCardinality":{"min":"0","max":"1"},"unit":{"name":"%","code":"%","system":"http://unitsofmeasure.org","default":false}},{"questionCode":"27353-2","localQuestionCode":null,"dataType":"REAL","header":false,"units":[{"name":"mg/dL","code":"mg/dL","system":"http://unitsofmeasure.org","default":false}],"codingInstructions":null,"copyrightNotice":null,"question":"Est. average glucose Bld gHb Est-mCnc","answers":null,"skipLogic":null,"restrictions":null,"defaultAnswer":null,"formatting":null,"calculationMethod":null,"linkId":"/27353-2","questionCodeSystem":"http://loinc.org","codeList":[{"code":"27353-2","display":"Est. average glucose Bld gHb Est-mCnc","system":"http://loinc.org"}],"questionCardinality":{"min":"1","max":"1"},"answerCardinality":{"min":"0","max":"1"},"unit":{"name":"mg/dL","code":"mg/dL","system":"http://unitsofmeasure.org","default":false}},{"questionCode":"14957-5","localQuestionCode":null,"dataType":"REAL","header":false,"units":[{"name":"mg/L","code":null,"system":null,"default":false}],"codingInstructions":null,"copyrightNotice":null,"question":"Microalbumin Ur-mCnc","answers":null,"skipLogic":null,"restrictions":null,"defaultAnswer":null,"formatting":null,"calculationMethod":null,"linkId":"/14957-5","questionCodeSystem":"http://loinc.org","codeList":[{"code":"14957-5","display":"Microalbumin Ur-mCnc","system":"http://loinc.org"}],"questionCardinality":{"min":"1","max":"1"},"answerCardinality":{"min":"0","max":"1"},"unit":{"name":"mg/L","code":null,"system":null,"default":false}},{"questionCode":"2514-8","localQuestionCode":null,"dataType":"CNE","header":false,"units":null,"codingInstructions":"Beta-hydroxybutyrate+Acetoacetate+Acetone","copyrightNotice":null,"question":"Ketones Ur Strip","answers":[{"label":null,"code":"LA6577-6","text":"Negative","other":null,"system":"http://loinc.org"},{"label":null,"code":"LA11832-5","text":"Trace","other":null,"system":"http://loinc.org"},{"label":null,"code":"LA8983-4","text":"Small","other":null,"system":"http://loinc.org"},{"label":null,"code":"LA6751-7","text":"Moderate","other":null,"system":"http://loinc.org"},{"label":null,"code":"LA8981-8","text":"Large","other":null,"system":"http://loinc.org"}],"skipLogic":null,"restrictions":null,"defaultAnswer":null,"formatting":null,"calculationMethod":null,"linkId":"/2514-8","questionCodeSystem":"http://loinc.org","codeList":[{"code":"2514-8","display":"Ketones Ur Strip","system":"http://loinc.org"}],"displayControl":{"answerLayout":{"type":"COMBO_BOX","columns":"0"}},"questionCardinality":{"min":"1","max":"1"},"answerCardinality":{"min":"0","max":"1"}},{"questionCode":"5792-7","localQuestionCode":null,"dataType":"REAL","header":false,"units":[{"name":"mg/dL","code":"mg/dL","system":"http://unitsofmeasure.org","default":false}],"codingInstructions":null,"copyrightNotice":null,"question":"Glucose Ur Strip-mCnc","answers":null,"skipLogic":null,"restrictions":null,"defaultAnswer":null,"formatting":null,"calculationMethod":null,"linkId":"/5792-7","questionCodeSystem":"http://loinc.org","codeList":[{"code":"5792-7","display":"Glucose Ur Strip-mCnc","system":"http://loinc.org"}],"questionCardinality":{"min":"1","max":"1"},"answerCardinality":{"min":"0","max":"1"},"unit":{"name":"mg/dL","code":"mg/dL","system":"http://unitsofmeasure.org","default":false}},{"questionCode":"9057-1","localQuestionCode":null,"dataType":"REAL","header":false,"units":[{"name":"kcal/(24.h)","code":"kcal/(24.h)","system":"http://unitsofmeasure.org","default":false}],"codingInstructions":null,"copyrightNotice":null,"question":"Calorie intake total 24h","answers":null,"skipLogic":null,"restrictions":null,"defaultAnswer":null,"formatting":null,"calculationMethod":null,"linkId":"/9057-1","questionCodeSystem":"http://loinc.org","codeList":[{"code":"9057-1","display":"Calorie intake total 24h","system":"http://loinc.org"}],"questionCardinality":{"min":"1","max":"1"},"answerCardinality":{"min":"0","max":"1"},"unit":{"name":"kcal/(24.h)","code":"kcal/(24.h)","system":"http://unitsofmeasure.org","default":false}},{"questionCode":"55400-6","localQuestionCode":null,"dataType":"ST","header":false,"units":null,"codingInstructions":null,"copyrightNotice":null,"question":"Date of last eye exam","answers":null,"skipLogic":null,"restrictions":null,"defaultAnswer":null,"formatting":null,"calculationMethod":null,"linkId":"/55400-6","questionCodeSystem":"http://loinc.org","codeList":[{"code":"55400-6","display":"Date of last eye exam","system":"http://loinc.org"}],"questionCardinality":{"min":"1","max":"1"},"answerCardinality":{"min":"0","max":"1"}}],"templateOptions":{"showQuestionCode":false,"showCodingInstruction":false,"allowMultipleEmptyRepeatingItems":false,"allowHTMLInInstructions":false,"displayControl":{"questionLayout":"vertical"},"viewMode":"auto","defaultAnswerLayout":{"answerLayout":{"type":"COMBO_BOX","columns":"0"}},"hideTreeLine":false,"hideIndentation":false,"hideRepetitionNumber":false,"displayScoreWithAnswerText":true}}
  questionnaire: LabresultsQuestionnaire = null

  constructor(public activeModal: NgbActiveModal, public nlmClinicalTableSearchService: NlmClinicalTableSearchService) { }

  ngOnInit(): void {

    // const parent: HTMLElement = document.getElementById('lhcFormContainer');
    // console.log("Adding Form to page", this.questionnaire)
    // LForms.Util.addFormToPage(this.questionnaire, parent);
    this.resetLabPanelForm()
  }

  submit() {

    if(LForms.Util.checkValidity(this.wcForm.nativeElement) != null){
      return
    }

    let formData = LForms.Util.getFormFHIRData(
      'DiagnosticReport',
      this.format,
      null,
      {bundleType: "transaction"}
    )
    console.log(formData)
  }
  onFormReady(e){
    console.log("onFormReady", e)
  }
  onError(e){
    console.log("onError", e)
  }

  private resetLabPanelForm() {
    this.newLabPanelTypeaheadForm = new FormGroup({
      data: new FormControl(null, Validators.required),
    })
    this.newLabPanelTypeaheadForm.valueChanges.subscribe(form => {
      console.log("CHANGE LabPanel IN MODAL", form)
      let val = form.data
      if(val && val.id){
        this.nlmClinicalTableSearchService.searchLabPanelQuestionnaire(val.id).subscribe((res: LabresultsQuestionnaire) => {
          this.questionnaire = res
        })
      } else {
        this.questionnaire = null
      }
    })
  }
}
