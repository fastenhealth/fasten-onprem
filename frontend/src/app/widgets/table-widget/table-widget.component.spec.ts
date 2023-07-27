import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableWidgetComponent } from './table-widget.component';
import {FastenApiService} from '../../services/fasten-api.service';
import {HTTP_CLIENT_TOKEN} from '../../dependency-injection';
import {HttpClient} from '@angular/common/http';
import encountersFixture from "../fixtures/encounters.json"

describe('TableWidgetComponent', () => {
  let component: TableWidgetComponent;
  let fixture: ComponentFixture<TableWidgetComponent>;
  let mockedFastenApiService

  beforeEach(async () => {
    mockedFastenApiService = jasmine.createSpyObj('FastenApiService', ['queryResources'])

    await TestBed.configureTestingModule({
      imports: [ TableWidgetComponent ],
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

    fixture = TestBed.createComponent(TableWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('tableProcessQueryResults', () => {
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
        let processedQueryResponse = component.processQueryResourcesSelectClause(component.widgetConfig.queries[0].q, encountersFixture)
        component.chartProcessQueryResults([processedQueryResponse])

        //assert
        expect(component.keys).toEqual([
          'id',
          'institution',
          'reason',
          'provider',
        ])
        expect(component.headers).toEqual([
          'Id',
          'Institution',
          'Reason',
          'Provider',
        ])
        expect(component.rows).toEqual([
          [ '9ea75521-441c-41e4-96df-237219e5ca63', 'PCP1336', '', 'Dr. Mariela993 Schamberger479'],
          [ 'cb3ae560-0a65-41f8-9712-aa3c5766ffe5', 'PCP1336', '', 'Dr. Mariela993 Schamberger479'],
          [ '47f5936b-ef68-4404-9183-8971e75e5a1d', 'HALLMARK HEALTH SYSTEM',  'Acute bronchitis (disorder)', 'Dr. Renato359 Jenkins714' ],
          [ 'd051d64b-5b2f-4465-92c3-4e693d54f653', 'PCP1336', '', 'Dr. Mariela993 Schamberger479'],
          [ 'cde6c902-957a-48c1-883f-38c808188fe3', 'PCP1336', '', 'Dr. Mariela993 Schamberger479' ],
          [ '9f4e40e3-6f6b-4959-b407-3926e9ed049c', 'PCP1336', '', 'Dr. Mariela993 Schamberger479' ],
          [ 'cd4bfc24-8fff-4eb0-bd93-3c7054551514',  'PROMPT CARE WALK-IN CLINIC', '',  'Dr. Candyce305 Prohaska837' ],
          [ '9adf6236-72dc-4abf-ab7e-df370b02701c', 'HALLMARK HEALTH SYSTEM', 'Otitis media', 'Dr. Renato359 Jenkins714' ],
          [ '9a6f9230-3549-43e1-83c8-f0fd740a24f3',  'HALLMARK HEALTH SYSTEM', 'Viral sinusitis (disorder)', 'Dr. Renato359 Jenkins714' ],
          [ '919f002e-ff43-4ea6-8acb-be3f1139c59d', 'HALLMARK HEALTH SYSTEM', 'Viral sinusitis (disorder)', 'Dr. Renato359 Jenkins714' ],
          [ '7a38b6bf-1787-4227-af08-ae10c29632e4', 'HALLMARK HEALTH SYSTEM', 'Viral sinusitis (disorder)', 'Dr. Renato359 Jenkins714' ],
          [ 'e44ec534-b752-4647-acd3-3794bc51db6d', 'PCP1336', '', 'Dr. Mariela993 Schamberger479' ],
          [ '51dec3d2-a098-4671-99bc-d7cf68561903', 'PCP1336', '', 'Dr. Mariela993 Schamberger479' ],
          [ '1a3bbe38-b7c3-43fc-b175-740adfcaa83a', 'PCP1336', '', 'Dr. Mariela993 Schamberger479' ],
          [ '3fba349b-e165-45f7-9cf2-66c391f293b6', 'HALLMARK HEALTH SYSTEM', 'Viral sinusitis (disorder)', 'Dr. Renato359 Jenkins714' ],
          [ '24f73ec3-9b7a-42a9-be03-53bffd9b304c', 'HALLMARK HEALTH SYSTEM' ,  'Acute viral pharyngitis (disorder)', 'Dr. Renato359 Jenkins714' ],
          [ '92b439da-6fdd-48e5-aa8d-b0543f840a1b', 'PCP1336', '', 'Dr. Mariela993 Schamberger479' ],
          [ 'd9a7c76f-dfe4-41c6-9924-82a405613f44', 'PCP1336', '', 'Dr. Mariela993 Schamberger479'  ],
        ])
      });

    })

  })

});
