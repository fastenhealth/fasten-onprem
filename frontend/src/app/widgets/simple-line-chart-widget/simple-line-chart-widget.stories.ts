import type { Meta, StoryObj } from '@storybook/angular';
import {SimpleLineChartWidgetComponent} from './simple-line-chart-widget.component';
import {applicationConfig, moduleMetadata} from '@storybook/angular';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {HTTP_CLIENT_TOKEN} from '../../dependency-injection';
import {importProvidersFrom} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FastenApiService} from '../../services/fasten-api.service';
import {DashboardWidgetQuery} from '../../models/widget/dashboard-widget-query';
import {Observable, of} from 'rxjs';


class MockFastenApiService implements Partial<FastenApiService> {
  public queryResources(query?: DashboardWidgetQuery): Observable<any[]> {
    console.log("CALLED MOCK")
    return of([])
  }
}


// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const meta: Meta<SimpleLineChartWidgetComponent> = {
  title: 'Widget/SimpleLineChartWidget',
  component: SimpleLineChartWidgetComponent,
  decorators: [
    applicationConfig({
      providers: [
        {
          provide: HttpClient,
          useClass: HttpClient
        },
        {
          provide: HTTP_CLIENT_TOKEN,
          useClass: HttpClient,
        },
        {
          provide: FastenApiService,
          useClass: MockFastenApiService
        },
        importProvidersFrom(HttpClientModule)
      ]
    }),
    moduleMetadata({
      imports: [CommonModule, HttpClientModule],
    })
  ],
  tags: ['autodocs'],
  render: (args: SimpleLineChartWidgetComponent) => ({
    props: {
      backgroundColor: null,
      ...args,
    },
  }),
  argTypes: {
    widgetConfig: {
      control: 'object',
    },
  },
};

export default meta;
type Story = StoryObj<SimpleLineChartWidgetComponent>;

// More on writing stories with args: https://storybook.js.org/docs/angular/writing-stories/args
export const Example: Story = {
  args: {
    widgetConfig: {
      item_type: 'simple-line-chart-widget',
      title_text: 'Example',
      description_text: '',
      queries: [
        {
          q: {
            select: [
              "valueQuantity.value as data",
              "(effectiveDateTime | issued).first() as label"
            ],
            from: "Observation",
            where: {
              "code": "http://loinc.org|29463-7,http://loinc.org|3141-9,http://snomed.info/sct|27113001"
            }
          }
        }
      ],
      parsing: {
        "xAxisKey": "label",
        "yAxisKey": "data"
      },
      width: 1,
      height: 1,
    }
  }
};

