import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardWidgetComponent } from './dashboard-widget.component';
import {FastenApiService} from '../../services/fasten-api.service';
import {HTTP_CLIENT_TOKEN} from '../../dependency-injection';
import {HttpClient} from '@angular/common/http';

// import {encountersJson} from '../fixtures/encounters.json'
import weightFixture from "../fixtures/weight.json"
import claimsFixture from "../fixtures/claims.json"
import immunizationsFixture from "../fixtures/immunizations.json"

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
  describe('processQueryResults', () => {
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
        component.processQueryResults([weightFixture['data']])

        //assert
        expect(component.isEmpty).toBeFalse()
        expect(component.loading).toBeFalse()
        expect(component.chartLabels).toEqual([
          "4c0ab718-2236-4933-bb31-2ff3a62f3c97",
          "6fa1b324-1951-4704-9257-41a8959c87d4",
          "75b5050f-a52c-4838-a860-fdf643e99bb4",
          "7bfe2e7e-0484-4fc7-90f5-35c2bace9742",
          "84c89bf1-aead-481f-8cec-b1ef9683eddd",
          "9a11be87-b435-4e39-b060-76b9d892f5d6",
          "a425342e-cb4b-4391-b320-634fcb91ec79",
          "a737caca-f54e-4896-b846-f4d1fa9b518c",
          "b771e5b8-6c57-4b45-beb7-88f5a3676991",
          "fc8b95c3-8068-4704-ac54-d3248ecdc64b"
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

              "aggregation_params":["resourceType"],
              "aggregation_type":"countBy"
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

                "aggregation_params":["resourceType"],
                "aggregation_type":"countBy"
              }
            }],
          "parsing": {
            "label": "key",
            "key": "value"
          }
        }
        //test
        component.processQueryResults([claimsFixture['data'], immunizationsFixture['data']])

        //assert
        expect(component.isEmpty).toBeFalse()
        expect(component.loading).toBeFalse()
        expect(component.chartLabels).toEqual([
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
          'd660e444-49a6-4633-a761-e95b12a5a8eb'
        ])
        expect(component.chartDatasets.length).toBe(2)
        // // @ts-ignore
        expect(component.chartDatasets[0].data.length).toBe(22)
        expect(component.chartDatasets[1].data.length).toBe(16)
        // expect(component.chartDatasets.length).toBe(component.chartLabels.length)
      });

    })

  })

});
