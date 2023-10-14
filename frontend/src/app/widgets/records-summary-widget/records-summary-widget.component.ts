import { Component, OnInit } from '@angular/core';
import {NgChartsModule} from 'ng2-charts';
import {CommonModule} from '@angular/common';
import {MomentModule} from 'ngx-moment';
import {LoadingWidgetComponent} from '../loading-widget/loading-widget.component';
import {EmptyWidgetComponent} from '../empty-widget/empty-widget.component';
import {DashboardWidgetComponent} from '../dashboard-widget/dashboard-widget.component';
import {DashboardWidgetConfig} from '../../models/widget/dashboard-widget-config';
import {Summary} from '../../models/fasten/summary';

class GroupedSummary {
  displayName: string
  imageName: string
  resourceTypes: string[]
  includedResourceTypes: string[] = []
  count: number = 0
}


@Component({
  standalone: true,
  imports: [CommonModule, LoadingWidgetComponent, EmptyWidgetComponent],
  selector: 'records-summary-widget',
  templateUrl: './records-summary-widget.component.html',
  styleUrls: ['./records-summary-widget.component.scss']
})
export class RecordsSummaryWidgetComponent extends DashboardWidgetComponent implements OnInit {

  // constructor() { }

  summary: Summary

  groupLookup: GroupedSummary[] = [
    {
      displayName: 'Allergies',
      imageName: 'allergies',
      resourceTypes: ['AllergyIntolerance', 'AdverseEvent'],
      includedResourceTypes:[],
      count: 0
    },
    {
      displayName: 'Care Team',
      imageName: 'care-team',
      resourceTypes: ['CareTeam', 'Practitioner', 'Patient', 'RelatedPerson', 'PractitionerRole'],
      includedResourceTypes:[],
      count: 0
    },
    {
      displayName: 'Clinical Notes',
      imageName: 'clinical-notes',
      resourceTypes: ['DocumentReference', 'DiagnosticReport'],
      includedResourceTypes:[],
      count: 0
    },
    {
      displayName: 'Files',
      imageName: 'files',
      resourceTypes: ['Binary', 'Media'],
      includedResourceTypes:[],
      count: 0
    },
    {
      displayName: 'Lab Results',
      imageName: 'lab-results',
      resourceTypes: ['Observation', 'Specimen'],
      includedResourceTypes:[],
      count: 0
    },
    {
      displayName: 'Health Issues',
      imageName: 'health-issues',
      resourceTypes: ['Conditions', 'Encounters'],
      includedResourceTypes:[],
      count: 0
    },
    {
      displayName: 'Facilities',
      imageName: 'facilities',
      resourceTypes: ['Organization', 'Location'],
      includedResourceTypes:[],
      count: 0
    },
    {
      displayName: 'Health Goals',
      imageName: 'health-goals',
      resourceTypes: ['Goal'],
      includedResourceTypes:[],
      count: 0
    },
    {
      displayName: 'Health Insurance',
      imageName: 'health-insurance',
      resourceTypes: ['Coverage', 'ExplanationOfBenefit', 'Claim'],
      includedResourceTypes:[],
      count: 0
    },
    {
      displayName: 'Health Assessments',
      imageName: 'health-assessments',
      resourceTypes: ['QuestionnaireResponse','Questionnaire', 'CarePlan', 'FamilyMemberHistory'],
      includedResourceTypes:[],
      count: 0
    },
    {
      displayName: 'Immunizations',
      imageName: 'immunizations',
      resourceTypes: ['Immunization'],
      includedResourceTypes:[],
      count: 0
    },
    {
      displayName: 'Implants',
      imageName: 'implants',
      resourceTypes: ['Device'],
      includedResourceTypes:[],
      count: 0
    },
    {
      displayName: 'Medications',
      imageName: 'medications',
      resourceTypes: ['Medication', 'MedicationRequest', 'MedicationStatement', 'MedicationAdministration', 'MedicationDispense'],
      includedResourceTypes:[],
      count: 0
    },
    {
      displayName: 'Demographics',
      imageName: 'demographics',
      resourceTypes: ['Patient'],
      includedResourceTypes:[],
      count: 0
    },
    {
      displayName: 'Procedures',
      imageName: 'procedures',
      resourceTypes: ['Procedure','ServiceRequest'],
      includedResourceTypes:[],
      count: 0
    },
    {
      displayName: 'Provenance',
      imageName: 'provenance',
      resourceTypes: ['Provenance'],
      includedResourceTypes:[],
      count: 0
    },
    {
      displayName: 'Appointments',
      imageName: 'appointments',
      resourceTypes: ['Appointment', 'Schedule', 'Slot'],
      includedResourceTypes:[],
      count: 0
    }
  ]

  ngOnInit(): void {
    //manually define the widget config, rather than pull from the configuration file
    this.widgetConfig = {
      id: 'records-summary-widget',
      item_type: 'records-summary-widget',
      description_text: 'Displays a summary of patient records',
      width: 4,
      height: 5,
      title_text: 'Medical Records',
      queries: [
      ]

    } as DashboardWidgetConfig
    super.ngOnInit();
    this.loading = true
    this.isEmpty = true

    this.fastenApi.getSummary().subscribe((summary: Summary) => {
      this.summary = summary

      for(let resourceTypeCount of summary.resource_type_counts){
        let foundGroup = false
        for(let groupKey in this.groupLookup){
          let group = this.groupLookup[groupKey]
          if(group.resourceTypes.indexOf(resourceTypeCount.resource_type) > -1){
            foundGroup = true
            this.groupLookup[groupKey].count += resourceTypeCount.count
            this.groupLookup[groupKey].includedResourceTypes.push(resourceTypeCount.resource_type)
          }
        }

        if(!foundGroup){
          console.log('no group found for ' + resourceTypeCount.resource_type)
          this.groupLookup[resourceTypeCount.resource_type] = {
            displayName: resourceTypeCount.resource_type,

            resourceTypes: [resourceTypeCount.resource_type],
            count: resourceTypeCount.count
          }
        }
      }

      //filter any groups with 0 counts
      this.groupLookup = this.groupLookup.filter((group) => {
        return group.count > 0
      })

    })
    //call Summary endpoint
    this.loading = false
    this.isEmpty = false
  }
}
