import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardWidgetComponent } from './dashboard-widget.component';
import {FastenApiService} from '../../services/fasten-api.service';
import {HTTP_CLIENT_TOKEN} from '../../dependency-injection';
import {HttpClient} from '@angular/common/http';

// import {encountersJson} from '../fixtures/encounters.json'
import weightFixture from "../fixtures/weight.json"
import claimsFixture from "../fixtures/claims.json"
import immunizationsFixture from "../fixtures/immunizations.json"
import encountersFixture from "../fixtures/encounters.json"
import {DashboardWidgetQuery} from '../../models/widget/dashboard-widget-query';

describe('DashboardWidgetComponent', () => {
  let component: DashboardWidgetComponent;
  let fixture: ComponentFixture<DashboardWidgetComponent>;
  let mockedFastenApiService

  beforeEach(async () => {
    mockedFastenApiService = jasmine.createSpyObj('FastenApiService', ['queryResources'])

    await TestBed.configureTestingModule({
      imports: [ DashboardWidgetComponent ],
      providers: [
        {
          provide: FastenApiService,
          useValue: mockedFastenApiService
        },
        {
          provide: HTTP_CLIENT_TOKEN,
          useClass: HttpClient,
        },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  describe('chartProcessQueryResults', () => {
    describe('Weight - SimpleLineChartWidget', () => {
      it('should parse data', () => {
        expect(component).toBeTruthy();

        //setup
        component.widgetConfig = {
          "title_text": "Weight",
          "description_text": "",
          "x": 8,
          "y": 0,
          "width": 2,
          "height": 2,
          "item_type": "simple-line-chart-widget",
          "queries": [{
            "q": {
              "select": [
                "valueQuantity.value as data",
                "(effectiveDateTime | issued).first() as label"
              ],
              "from": "Observation",
              "where": {
                "code": "http://loinc.org|29463-7,http://loinc.org|3141-9,http://snomed.info/sct|27113001"
              }
            }
          }],
          "parsing": {
            "xAxisKey": "label",
            "yAxisKey": "data"
          }
        }
        //test
        let processedQueryResponse = component.processQueryResourcesSelectClause(component.widgetConfig.queries[0].q, weightFixture)
        component.chartProcessQueryResults([processedQueryResponse])

        //assert
        expect(component.isEmpty).toBeFalse()
        expect(component.loading).toBeFalse()
        expect(component.chartLabels).toEqual([
          ['2012-04-23T12:22:44-04:00'],
          ['2016-05-16T12:22:44-04:00'],
          ['2010-04-12T12:22:44-04:00'],
          ['2014-05-05T12:22:44-04:00'],
          ['2011-04-18T12:22:44-04:00'],
          ['2019-06-03T12:22:44-04:00'],
          ['2015-05-11T12:22:44-04:00'],
          ['2013-04-29T12:22:44-04:00'],
          ['2017-05-22T12:22:44-04:00'],
          ['2018-05-28T12:22:44-04:00'],
        ])
        expect(component.chartDatasets.length).toBe(1)
        // @ts-ignore
        expect(component.chartDatasets[0].data.length).toBe(10)
        expect(component.chartDatasets[0].data.length).toBe(component.chartLabels.length)
      });

    })

    describe('Compliance - DualGaugesWidget', () => {
      it('should parse data', () => {
        expect(component).toBeTruthy();

        //setup
        component.widgetConfig = {
          "title_text": "Compliance",
          "description_text": "Use to track important healthcare and medical tasks.",
          "x": 0,
          "y": 10,
          "width": 4,
          "height": 2,
          "item_type": "dual-gauges-widget",
          "queries": [{
            "dataset_options": {
              "label": "Vaccines"
            },
            "q": {
              "select": [],
              "from": "Immunization",
              "where": {},

              "aggregations":{
                "count_by": {"field": "source_resource_type"}
              },
            }
          },
            {
              "dataset_options": {
                "label": "Claims"
              },
              "q": {
                "select": [],
                "from": "Claim",
                "where": {},

                "aggregations":{
                  "count_by": {"field": "source_resource_type"}
                },
              }
            }],
          "parsing": {
            "label": "key",
            "key": "value"
          }
        }
        //test
        let processedClaimsQueryResponse = component.processQueryResourcesSelectClause(component.widgetConfig.queries[0].q, claimsFixture)
        let processedImmunizationsQueryResponse = component.processQueryResourcesSelectClause(component.widgetConfig.queries[1].q, immunizationsFixture)
        component.chartProcessQueryResults([processedClaimsQueryResponse, processedImmunizationsQueryResponse])

        //assert
        expect(component.isEmpty).toBeFalse()
        expect(component.loading).toBeFalse()
        expect(component.chartLabels).toEqual([ //TODO: should this be 'Immunization' and 'Claim'?
          '2a332c10-0a12-4d96-a819-0b2a6bfae84a',
          '31830307-f2ea-4aee-ab3a-d9623b5cfd2c',
          '4738ca48-c949-4d1e-be77-71b7b81a1aa2',
          '51ace308-124f-45fa-8d2a-d8e0d84716f7',
          '684178bf-2231-4641-a581-9ecde3b3e60c',
          '70435780-0fcf-4d08-af8d-a90cac6806d9',
          '70db153f-b145-44a0-b8aa-aac646d01c24',
          '720374cc-f64a-402e-9f07-940fc22ceafe',
          '82c6b29a-453c-4bc7-b3e8-94bf997622d4',
          '82f6e9a4-46ba-4d78-a0cb-d37609662918',
          '85205d78-9fe4-48d6-979d-5697fa42aebc',
          'a29483c2-7bdc-428d-aa5a-1777fe18b81a',
          'c8ea36b5-1c0b-4488-9df4-6b101048eec5',
          'd4ddd4b5-f57b-4304-a12b-b74914e79d88',
          'd591e8f1-744b-464a-99ab-9131b970863c',
          'd660e444-49a6-4633-a761-e95b12a5a8eb',
        ])
        expect(component.chartDatasets.length).toBe(2)
        // // @ts-ignore
        expect(component.chartDatasets[0].data.length).toBe(22)
        expect(component.chartDatasets[1].data.length).toBe(16)
        // expect(component.chartDatasets.length).toBe(component.chartLabels.length)
      });

    })

    describe('Recent Encounters - TableWidget', () => {
      it('should parse data', () => {
        expect(component).toBeTruthy();

        //setup
        component.widgetConfig = {
          "title_text": "Recent Encounters",
          "description_text": "Recent interactions with healthcare providers",
          "x": 4,
          "y": 10,
          "width": 8,
          "height": 4,
          "item_type": "table-widget",
          "queries": [{
            "q": {
              "select": [
                "serviceProvider.display as institution",
                "period.start as date",
                "reasonCode.coding.display.first() as reason",
                "participant.individual.display as provider"
              ],
              "from": "Encounter",
              "where": {}
            }
          }],
          "parsing": {
            "Id": "id",
            "Institution": "institution",
            "Reason": "reason",
            "Provider": "provider"
          }
        }
        //test
        let processedEncountersQueryResponse = component.processQueryResourcesSelectClause(component.widgetConfig.queries[0].q, encountersFixture)
        component.chartProcessQueryResults([processedEncountersQueryResponse])

        //assert
        expect(component.isEmpty).toBeFalse()
        expect(component.loading).toBeFalse()
        expect(component.chartLabels).toEqual([
          '9ea75521-441c-41e4-96df-237219e5ca63',
          'cb3ae560-0a65-41f8-9712-aa3c5766ffe5',
          '47f5936b-ef68-4404-9183-8971e75e5a1d',
          'd051d64b-5b2f-4465-92c3-4e693d54f653',
          'cde6c902-957a-48c1-883f-38c808188fe3',
          '9f4e40e3-6f6b-4959-b407-3926e9ed049c',
          'cd4bfc24-8fff-4eb0-bd93-3c7054551514',
          '9adf6236-72dc-4abf-ab7e-df370b02701c',
          '9a6f9230-3549-43e1-83c8-f0fd740a24f3',
          '919f002e-ff43-4ea6-8acb-be3f1139c59d',
          '7a38b6bf-1787-4227-af08-ae10c29632e4',
          'e44ec534-b752-4647-acd3-3794bc51db6d',
          '51dec3d2-a098-4671-99bc-d7cf68561903',
          '1a3bbe38-b7c3-43fc-b175-740adfcaa83a',
          '3fba349b-e165-45f7-9cf2-66c391f293b6',
          '24f73ec3-9b7a-42a9-be03-53bffd9b304c',
          '92b439da-6fdd-48e5-aa8d-b0543f840a1b',
          'd9a7c76f-dfe4-41c6-9924-82a405613f44',
        ])
        expect(component.chartDatasets.length).toBe(1)
        // // @ts-ignore
        expect(component.chartDatasets[0].data.length).toBe(18)
        // expect(component.chartDatasets.length).toBe(component.chartLabels.length)
      });

    })
    describe('Vitals - ListWidget', () => {})
    describe('Resource Aggregation - DonutWidget', () => {})

  })

  it('fhirPathMapQueryFn should generate a valid select map with aliases', () => {
    //setup
    let patient = {
      "resourceType": "Patient",
      "id": "example",
      "address": [
        {
          "use": "home",
          "city": "PleasantVille",
          "type": "both",
          "state": "Vic",
          "line": [
            "534 Erewhon St"
          ],
          "postalCode": "3999",
          "period": {
            "start": "1974-12-25"
          },
          "district": "Rainbow",
          "text": "534 Erewhon St PeasantVille, Rainbow, Vic  3999"
        }
      ]
    }

    let query = {
      // use: string
      select: ['address.use', "address.where(type='both').state as state"],
      from: 'Patient',
      where: {'id':'example'}

    } as DashboardWidgetQuery


    let query2 = {
      // use: string
      select: ['*', "address.where(type='both').use | address.city as joined"],
      from: 'Patient',
      where: {'id':'example'}

    } as DashboardWidgetQuery


    //test
    let fn = component.fhirPathMapQueryFn(query)
    expect(fn(patient)).toEqual({ "address.use": [ 'home' ], "state": [ 'Vic' ], 'id': 'example', 'resourceType': 'Patient' })

    // let fn2 = service.fhirPathMapQueryFn(query2)
    let fn2 = component.fhirPathMapQueryFn(query2)
    expect(fn2(patient)).toEqual({
      "joined": [ 'home', 'PleasantVille' ],
      "*": {
        "resourceType": "Patient",
        "id": "example",
        "address": [
          {
            "use": "home",
            "city": "PleasantVille",
            "type": "both",
            "state": "Vic",
            "line": [
              "534 Erewhon St"
            ],
            "postalCode": "3999",
            "period": {
              "start": "1974-12-25"
            },
            "district": "Rainbow",
            "text": "534 Erewhon St PeasantVille, Rainbow, Vic  3999"
          }
        ]
      }, 'id': 'example', 'resourceType': 'Patient' })


  });

});
