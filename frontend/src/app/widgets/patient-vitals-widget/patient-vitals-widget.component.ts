import { Component, OnInit } from '@angular/core';
import {NgChartsModule} from 'ng2-charts';
import {DashboardWidgetComponent} from '../dashboard-widget/dashboard-widget.component';
import {DashboardWidgetConfig} from '../../models/widget/dashboard-widget-config';
import * as _ from 'lodash';
import moment from "moment";
import {CommonModule} from '@angular/common';
import fhirpath from 'fhirpath';
import {MomentModule} from 'ngx-moment';
@Component({
  standalone: true,
  imports: [NgChartsModule, CommonModule, MomentModule],
  selector: 'patient-vitals-widget',
  templateUrl: './patient-vitals-widget.component.html',
  styleUrls: ['./patient-vitals-widget.component.scss']
})
export class PatientVitalsWidgetComponent extends DashboardWidgetComponent implements OnInit {

  name: string = ''
  age: string = ''
  gender: string = ''
  vitalSigns: {
    display: string,
    code: string,
    date: string,
    value: string,
    unit: string
  }[] = []




  ngOnInit(): void {
    //manually define the widget config, rather than pull from the configuration file
    this.widgetConfig = {
      id: 'patient-vitals-widget',
      title_text: 'Patient Vitals',
      queries: [
        {
          q: {
            select: [
              "code.coding as codes",
              "effectiveDateTime | issued as date",
              "component as components",
              "valueQuantity as valueQuantity"
            ],
            from: "Observation",
            where: [
              "(category.coding.where(system = 'http://terminology.hl7.org/CodeSystem/observation-category' and code = 'vital-signs')).exists()"
            ]
          }
        },
        {
          q: {
            select: [
              "name.where(use = 'official') as name",
              "birthDate as birthDate",
              "gender as gender",
            ],
            from: "Patient",
            where: []
          }
        },

      ]

    } as DashboardWidgetConfig
    super.ngOnInit();
    this.chartDatasetsSubject.subscribe(this.processQueryResults.bind(this))
  }

  //process query results

  processQueryResults(queryResults: any[]): void {
    if(!queryResults || queryResults.length < 2){
      return
    }

    //process Patient objecst
    let sortedPatients = _.sortBy(queryResults?.[1], ['birthDate'])
    for(let patient of sortedPatients){
      console.log("PROCESSING PATIENT DATA =======> ", patient)
      if(!this.name && _.get(patient, 'name[0].family') && _.get(patient, 'name[0].given[0]')){
        this.name = `${_.get(patient, 'name[0].given[0]')} ${_.get(patient, 'name[0].family')}`
      }
      if(!this.age && _.get(patient, 'birthDate')){
        this.age = `${moment().diff(moment(_.get(patient, 'birthDate')), 'years')} years`
      }
      if(!this.gender && _.get(patient, 'gender[0]')){
        this.gender = _.get(patient, 'gender[0]')
      }
    }



    let vitalSignCodeLookup = queryResults?.[0].reduce((acc, observation) => {


      if(observation.codes.length){
        let foundCode = observation.codes.find((code) => code.system === 'http://loinc.org')
        if(foundCode && !(foundCode.code === '85354-9' || foundCode.code === '55284-4')){ //
          acc[foundCode.code] = acc[foundCode.code] || {
            code: foundCode.code,
            display: this.vitalSignsCodeLookup[foundCode.code] || foundCode.display,
          }
          let vitalSignCodeLookupEntry = acc[foundCode.code]

          let foundDate = observation.date?.[0] || ""
          let existingDate = vitalSignCodeLookupEntry.date || ""
          console.log("OBSERVATION!!!!!!", foundCode, foundDate, observation)
          if(foundDate > existingDate){
            vitalSignCodeLookupEntry.date = foundDate

            vitalSignCodeLookupEntry.unit = observation?.valueQuantity?.[0]?.unit
            vitalSignCodeLookupEntry.value = observation?.valueQuantity?.[0]?.value
          }

          acc[foundCode.code] = vitalSignCodeLookupEntry
        }
        else if(foundCode && (foundCode.code === '85354-9' || foundCode.code === '55284-4')){
          let components = observation.components
          for(let component of components){
            let foundComponentCode = component?.code?.coding?.find((code) => code.system === 'http://loinc.org')
            if(foundComponentCode){
              acc[foundComponentCode.code] = acc[foundComponentCode.code] || {
                code: foundComponentCode.code,
                display: this.vitalSignsCodeLookup[foundComponentCode.code] || foundComponentCode.display,
              }
              let vitalSignCodeLookupEntry = acc[foundComponentCode.code]

              let foundDate = observation.date?.[0] || ""
              let existingDate = vitalSignCodeLookupEntry.date || ""
              console.log("OBSERVATION!!!!!!", foundComponentCode, foundDate, observation)
              if(foundDate > existingDate){
                vitalSignCodeLookupEntry.date = foundDate

                vitalSignCodeLookupEntry.unit = component?.valueQuantity?.unit
                vitalSignCodeLookupEntry.value = component?.valueQuantity?.value
              }

              acc[foundComponentCode.code] = vitalSignCodeLookupEntry
            }
          }
        }
      }
      return acc

    }, {})


    // for(let observation of sortedObservations){
    //
    //
    //   console.log(observation)
    //
    //   if(observation.codes.length){
    //
    //     let foundCode = observation.codes.
    //
    //     vitalSignCodeLookup[foundCode[0]] = vitalSignCodeLookup[foundCode[0]] || {code: foundCode[0]}
    //     let vitalSignCodeLookupEntry = vitalSignCodeLookup[foundCode[0]]
    //
    //     if(vitalSignCodeLookupEntry.date !> foundDate?.[0]){
    //       vitalSignCodeLookupEntry.date = foundDate?.[0]
    //
    //       vitalSignCodeLookupEntry.unit = fhirpath.evaluate(observation, "valueQuantity.value")
    //       vitalSignCodeLookupEntry.value = fhirpath.evaluate(observation, "valueQuantity.value")
    //     }
    //
    //     vitalSignCodeLookup[foundCode[0]] = vitalSignCodeLookupEntry
    //   }
    //   // console.log("PROCESSING OBSERVATION DATA =======> ", observation)
    //   // if(_.get(observation, 'code.coding[0].code') && _.get(observation, 'effectiveDateTime') && _.get(observation, 'valueQuantity.value') && _.get(observation, 'valueQuantity.unit')){
    //   //   this.vitalSigns.push({
    //   //     code: _.get(observation, 'code.coding[0].code'),
    //   //     date: moment(_.get(observation, 'effectiveDateTime')).format('MM/DD/YYYY'),
    //   //     value: _.get(observation, 'valueQuantity.value'),
    //   //     unit: _.get(observation, 'valueQuantity.unit')
    //   //   })
    //   // }
    //
    //
    // }

    for(let key in vitalSignCodeLookup){
      this.vitalSigns.push(vitalSignCodeLookup[key])
    }

    console.log("PRINTING DETECTED PATIENT DATA", this.name, this.age, this.gender, vitalSignCodeLookup, this.vitalSigns)
  }


  vitalSignsCodeLookup = {
    "9279-1": "Respiratory Rate",
    "8867-4": "Heart Rate",
    "2708-6": "Oxygen saturation",
    "59408-5": "Oxygen saturation",
    "8310-5": "Body temperature",
    "8302-2": "Body Height",
    "29463-7": "Body Weight",
    "39156-5": "Body Mass Index",
    "8480-6": "Systolic Blood Pressure",
    "8462-4": "Diastolic Blood Pressure",
  }

}

//55284-4 Blood pressure systolic and diastolic
